import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Star,
  Smartphone,
  Mail,
  MapPin,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

// --- Custom TikTok Icon to match Lucide style ---
const TikTokIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// --- SEO & Content Constants ---
const LOCATIONS = ['Northwest', 'Wirral', 'Merseyside', 'Stoke-on-Trent', 'Stoke', 'Cheshire', 'Liverpool'];

const SERVICES = [
  {
    title: 'Driveways',
    desc: 'Premium block paving, resin-bound, and decorative gravel driveways across the Northwest.',
  },
  {
    title: 'Patios',
    desc: 'High-end porcelain and natural stone patio installations for luxury outdoor living.',
  },
  {
    title: 'Fencing',
    desc: 'Commercial grade and decorative domestic fencing solutions built for durability.',
  },
  {
    title: 'Landscaping',
    desc: 'Complete architectural garden transformations and heavy-duty landscaping.',
  },
  {
    title: 'Drainage',
    desc: 'Expert ground drainage solutions to prevent flooding and manage runoff.',
  },
  {
    title: 'Foundations',
    desc: 'Precision-engineered foundations and concrete footings for extensions and new builds.',
  },
];

const SOCIAL_LINKS = {
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  tiktok: 'https://tiktok.com',
};

// lucide-react doesn't include brand icons like Facebook/Instagram in this build.
const FacebookIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <path d="M16 11.37a4 4 0 1 1-7.9 1.26 4 4 0 0 1 7.9-1.26Z" />
    <path d="M17.5 6.5h.01" />
  </svg>
);

/** Shown in mailto: when Netlify is not configured; set in .env as VITE_BUSINESS_QUOTE_EMAIL (rebuild required). */
const MAILTO_QUOTE_EMAIL =
  (typeof import.meta.env.VITE_BUSINESS_QUOTE_EMAIL === 'string' &&
    import.meta.env.VITE_BUSINESS_QUOTE_EMAIL.trim()) ||
  'you@example.com';

async function submitEnquiry(payload) {
  const res = await fetch('/.netlify/functions/enquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 413) {
    throw new Error(data.error || 'Request too large. Send fewer or smaller photos.');
  }
  if (!res.ok || data.ok === false) throw new Error(data.error || 'Request failed');
}

const MAX_QUOTE_PHOTOS = 50;
const MAX_QUOTE_PHOTO_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BASE64_CHARS = 4_500_000;

function readFileAsAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      const data = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({
        name: file.name || 'photo.jpg',
        mime: file.type || 'application/octet-stream',
        data,
      });
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reviews] = useState([]);
  const photoInputRef = useRef(null);

  // Form States
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Driveways',
    message: '',
    website: '', // honeypot (spam)
  });
  const [quoteFiles, setQuoteFiles] = useState([]);
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, text: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const openEmailFallback = () => {
    const subject = encodeURIComponent(`Quote request — ${quoteForm.service} — ${quoteForm.name}`);
    const body = encodeURIComponent(
      [
        `NAME: ${quoteForm.name}`,
        `EMAIL: ${quoteForm.email}`,
        `PHONE: ${quoteForm.phone}`,
        `SERVICE: ${quoteForm.service}`,
        ``,
        `MESSAGE:`,
        quoteForm.message,
      ].join('\n'),
    );

    const to = encodeURIComponent(MAILTO_QUOTE_EMAIL);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  // 1. Auth Initialization (Firebase-free shim)
  useEffect(() => {
    setUser({ uid: 'local' });
  }, []);

  // Handlers
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const files = quoteFiles.slice(0, MAX_QUOTE_PHOTOS);
      for (const f of files) {
        if (f.size > MAX_QUOTE_PHOTO_BYTES) {
          setStatus({ type: 'error', msg: `Photo too large: ${f.name}. Try a smaller image.` });
          return;
        }
      }
      const attachments = await Promise.all(files.map(readFileAsAttachment));
      const totalBase64 = attachments.reduce((n, a) => n + (a.data?.length || 0), 0);
      if (totalBase64 > MAX_TOTAL_BASE64_CHARS) {
        setStatus({
          type: 'error',
          msg: 'Total photo size is too large for one send. Remove a few images or use smaller files, then try again.',
        });
        return;
      }

      await submitEnquiry({
        type: 'quote',
        name: quoteForm.name,
        email: quoteForm.email,
        phone: quoteForm.phone,
        service: quoteForm.service,
        message: quoteForm.message,
        website: quoteForm.website,
        attachments,
        createdAt: new Date().toISOString(),
        status: 'new',
      });
      setQuoteForm({ name: '', email: '', phone: '', service: 'Driveways', message: '', website: '' });
      setQuoteFiles([]);
      if (photoInputRef.current) photoInputRef.current.value = '';
      setStatus({ type: 'success', msg: 'Quote request sent successfully! We will contact you soon.' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
    } catch (err) {
      const msg = String(err?.message || '');
      const looksLikeNotConfigured =
        msg.toLowerCase().includes('not configured') ||
        msg.toLowerCase().includes('smtp') ||
        msg.toLowerCase().includes('google');

      if (looksLikeNotConfigured) {
        openEmailFallback();
        setStatus({
          type: 'success',
          msg:
            'Opening your email app. Photos cannot attach through this fallback; after you set Netlify email (SMTP), the form will send real attachments.',
        });
        setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
        return;
      }

      setStatus({ type: 'error', msg: 'Failed to send request.' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      // Keeping your exact UX; can be wired to email later if you want.
      setReviewForm({ author: '', rating: 5, text: '' });
      setStatus({ type: 'success', msg: 'Review submitted for moderation. Thank you!' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to post review.' });
    }
  };

  const Nav = () => (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <img
                src="/S.W.M.logo.svg"
                alt="S.W.M Groundsworks logo"
                className="h-12 w-auto max-w-[120px] object-contain"
              />
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-xl tracking-tighter text-black">S.W.M</span>
                <span className="text-[10px] font-black tracking-[0.3em] text-zinc-400">GROUNDSWORKS</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {['home', 'services', 'work', 'reviews'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`capitalize text-[10px] font-black tracking-[0.2em] transition-all py-1 border-b-2 ${
                  activeTab === item
                    ? 'text-black border-black'
                    : 'text-zinc-400 border-transparent hover:text-black hover:border-zinc-300'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('quote')}
              className="bg-black text-white px-8 py-3 rounded text-[10px] font-black tracking-[0.2em] hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-black/10"
            >
              GET QUOTE
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-100 p-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
          {['home', 'services', 'work', 'reviews', 'quote'].map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveTab(item);
                setIsMenuOpen(false);
              }}
              className={`block w-full text-center py-2 capitalize font-black tracking-[0.2em] text-sm ${
                activeTab === item ? 'text-black' : 'text-zinc-400'
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </nav>
  );

  const Hero = () => (
    <section className="relative py-28 lg:py-48 overflow-hidden bg-black text-white flex flex-col items-center text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        <div className="rounded-2xl p-2 sm:p-3 mb-10">
          <img
            src="/S.W.M.logo.svg"
            alt="S.W.M Groundsworks"
            className="h-44 sm:h-52 md:h-64 w-auto object-contain opacity-95 mix-blend-multiply [filter:contrast(1.05)_brightness(1.08)] drop-shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
          />
        </div>
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 rounded-full mb-10 text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-md">
          <ShieldCheck size={14} className="text-zinc-400" /> Groundsworks Northwest & Stoke-on-Trent
        </div>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] mb-12 tracking-tighter max-w-5xl">
          STRUCTURAL <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 via-zinc-400 to-zinc-600">PERFECTION.</span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed mb-14 max-w-3xl font-medium px-4">
          The leading specialist in elite groundsworks for Wirral, Merseyside, and Stoke-on-Trent. We build the foundations for your luxury projects.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-md px-4">
          <button
            onClick={() => setActiveTab('quote')}
            className="flex-1 bg-white text-black px-12 py-6 rounded font-black text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/5"
          >
            START PROJECT <ArrowRight size={18} />
          </button>
          <button
            onClick={() => setActiveTab('work')}
            className="flex-1 bg-transparent text-white border border-zinc-700 px-12 py-6 rounded font-black text-xs tracking-[0.3em] hover:bg-zinc-900 transition-all active:scale-95"
          >
            SEE RESULTS
          </button>
        </div>
      </div>

      {/* Dynamic Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black pointer-events-none" />
    </section>
  );

  const ServiceAreas = () => (
    <section className="py-20 bg-zinc-900 text-white border-y border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h3 className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase mb-12">Areas of Operation</h3>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
          {LOCATIONS.map((loc, i) => (
            <div key={i} className="flex items-center gap-2 text-zinc-300 font-black tracking-widest text-sm hover:text-white transition-colors cursor-default">
              <MapPin size={16} className="text-zinc-600" /> {loc.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const PORTFOLIO_ITEMS = [
    {
      title: 'Driveway',
      subtitle: 'Tarmac / finishing',
      beforeSrc: '/images/driveway pic.jpeg',
      afterSrc: '/images/tarmac.jpeg',
    },
    {
      title: 'Steps',
      subtitle: 'Stone steps & detail',
      beforeSrc: '/images/steps pic .jpeg',
      afterSrc: '/images/steps 2.jpeg',
    },
    {
      title: 'Garden',
      subtitle: 'Landscaping finish',
      beforeSrc: '/images/garden pic.jpeg',
      afterSrc: '/images/garden pic 3.jpeg',
    },
  ];

  const Gallery = () => (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase mb-6">Proven Excellence</h2>
        <h3 className="text-5xl font-black text-black tracking-tighter mb-20">Portfolio of Work</h3>

        <div className="grid md:grid-cols-3 gap-12 text-left">
          {PORTFOLIO_ITEMS.map((item) => (
            <div key={item.title} className="group bg-white rounded-lg overflow-hidden border border-zinc-100 shadow-sm transition-all hover:shadow-2xl">
              <div className="grid grid-cols-2 h-64 md:h-72">
                <div className="relative bg-zinc-100 flex items-center justify-center border-r border-zinc-200 overflow-hidden">
                  <img
                    src={item.beforeSrc}
                    alt={`${item.title} before`}
                    className="h-full w-full object-cover object-[50%_20%] scale-[1.12] transition-transform duration-1000 group-hover:scale-[1.18]"
                    loading="lazy"
                  />
                </div>
                <div className="relative bg-zinc-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.afterSrc}
                    alt={`${item.title} after`}
                    className="h-full w-full object-cover object-[50%_20%] scale-[1.12] transition-transform duration-1000 group-hover:scale-[1.18]"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="p-10">
                <h3 className="font-black text-xl mb-3 text-black">{item.title.toUpperCase()}</h3>
                <p className="text-zinc-500 text-[10px] tracking-widest uppercase font-black">{item.subtitle.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h4 className="text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase mb-10">More work</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              '/images/fence pic.jpeg',
              '/images/gate pic .jpeg',
              '/images/porch pic.jpeg',
              '/images/indian stone pic.jpeg',
              '/images/tiles pic.jpeg',
              '/images/tiles pic 2.jpeg',
              '/images/tiles pic 3.jpeg',
              '/images/garden pic 2.jpeg',
            ].map((src) => (
              <div key={src} className="bg-zinc-100 border border-zinc-200 rounded overflow-hidden aspect-square">
                <img src={src} alt="S.W.M Groundsworks work" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      <Nav />

      {activeTab === 'home' && (
        <>
          <Hero />
          <ServiceAreas />
          <section className="bg-white py-28 border-b border-zinc-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
                {[
                  { label: 'Regional Experience', val: '22Y+' },
                  { label: 'Successful Projects', val: '500+' },
                  { label: 'Satisfaction Rate', val: '100%' },
                  { label: 'Insured Liability', val: '£5M' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-5xl font-black text-black mb-3 tracking-tighter">{stat.val}</p>
                    <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em] leading-tight px-4">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <Gallery />
        </>
      )}

      {activeTab === 'services' && (
        <section className="py-40 bg-white animate-in fade-in duration-1000 flex flex-col items-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-xs font-black tracking-[0.5em] text-zinc-400 uppercase mb-10">Northwest Groundsworks</h2>
            <h3 className="text-6xl font-black text-black tracking-tighter mb-28">OUR CORE CAPABILITIES</h3>
            <div className="grid md:grid-cols-3 gap-12">
              {SERVICES.map((s, i) => (
                <div key={i} className="group p-12 bg-zinc-50 rounded border border-zinc-100 text-left hover:bg-black hover:text-white transition-all duration-700">
                  <div className="w-14 h-14 bg-white text-black rounded flex items-center justify-center mb-10 shadow-sm group-hover:bg-zinc-800 group-hover:text-white transition-colors">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-2xl font-black mb-6 tracking-tight">{s.title.toUpperCase()}</h3>
                  <p className="text-zinc-500 group-hover:text-zinc-400 leading-relaxed text-sm font-bold tracking-tight">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'work' && <Gallery />}

      {activeTab === 'reviews' && (
        <section className="py-40 bg-white flex flex-col items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="grid lg:grid-cols-12 gap-24 items-start">
              <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start">
                <h2 className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase mb-8">Verified Clients</h2>
                <h3 className="text-7xl font-black text-black mb-12 leading-[0.8] tracking-tighter">
                  CLIENT <br />
                  TRUST.
                </h3>

                <form onSubmit={handleReviewSubmit} className="bg-zinc-50 p-12 rounded border border-zinc-200 w-full">
                  <h3 className="font-black text-xs mb-10 uppercase tracking-[0.3em] text-black">SHARE YOUR EXPERIENCE</h3>
                  <div className="space-y-8">
                    <input
                      required
                      placeholder="FULL NAME"
                      className="w-full px-6 py-5 bg-white border border-zinc-200 rounded outline-none focus:border-black text-[10px] font-black tracking-[0.3em] transition-all"
                      value={reviewForm.author}
                      onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value.toUpperCase() })}
                    />
                    <div className="flex justify-center lg:justify-start gap-3">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                          className={`p-1 ${reviewForm.rating >= num ? 'text-black' : 'text-zinc-300'}`}
                        >
                          <Star size={24} fill={reviewForm.rating >= num ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      required
                      placeholder="DESCRIBE THE CRAFTSMANSHIP..."
                      className="w-full px-6 py-5 bg-white border border-zinc-200 rounded outline-none focus:border-black text-[10px] font-black tracking-[0.3em] transition-all min-h-[150px]"
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    />
                    <button type="submit" className="w-full bg-black text-white font-black py-6 rounded text-[10px] tracking-[0.4em] hover:bg-zinc-800 transition-colors">
                      POST FEEDBACK
                    </button>
                    {status.msg && (
                      <p className={`text-[10px] font-black text-center mt-6 tracking-[0.2em] ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {status.msg.toUpperCase()}
                      </p>
                    )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-12 w-full">
                {reviews.filter((r) => r.isApproved).length === 0 ? (
                  <div className="p-32 text-center border-4 border-dashed border-zinc-100 rounded text-zinc-300 font-black uppercase tracking-[0.5em] text-xs">
                    ARCHIVING FEEDBACK
                  </div>
                ) : (
                  reviews
                    .filter((r) => r.isApproved)
                    .map((r, i) => (
                      <div key={r.id || i} className="bg-white p-12 rounded border border-zinc-100 shadow-sm transition-all hover:shadow-xl">
                        <div className="flex text-zinc-200 mb-8 gap-2">
                          {[...Array(r.rating)].map((_, idx) => (
                            <Star key={idx} size={18} fill="black" stroke="black" />
                          ))}
                        </div>
                        <p className="text-2xl text-black font-medium italic mb-10 leading-relaxed tracking-tight">"{r.text}"</p>
                        <p className="font-black text-xs tracking-[0.4em] uppercase text-zinc-400">— {r.author}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'quote' && (
        <section className="py-40 flex items-center justify-center bg-zinc-50">
          <div className="max-w-4xl w-full px-4">
            <div className="bg-white rounded p-16 md:p-24 shadow-2xl border border-zinc-100 text-center flex flex-col items-center">
              <h2 className="text-xs font-black tracking-[0.5em] text-zinc-400 uppercase mb-10">Consultation</h2>
              <h3 className="text-6xl font-black text-black tracking-tighter mb-20">PROJECT INQUIRY</h3>

              <form onSubmit={handleQuoteSubmit} className="space-y-12 w-full max-w-2xl">
                <input
                  value={quoteForm.website}
                  onChange={(e) => setQuoteForm({ ...quoteForm, website: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="text-left">
                    <label className="block text-[9px] font-black text-zinc-400 mb-4 uppercase tracking-[0.4em]">FULL NAME</label>
                    <input
                      required
                      className="w-full px-6 py-5 bg-zinc-50 border border-zinc-200 rounded focus:border-black outline-none transition-all font-black text-xs tracking-widest uppercase"
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-[9px] font-black text-zinc-400 mb-4 uppercase tracking-[0.4em]">CONTACT NUMBER</label>
                    <input
                      required
                      className="w-full px-6 py-5 bg-zinc-50 border border-zinc-200 rounded focus:border-black outline-none transition-all font-black text-xs"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-[9px] font-black text-zinc-400 mb-4 uppercase tracking-[0.4em]">EMAIL IDENTIFICATION</label>
                  <input
                    required
                    type="email"
                    className="w-full px-6 py-5 bg-zinc-50 border border-zinc-200 rounded focus:border-black outline-none transition-all font-black text-xs"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                  />
                </div>

                <div className="text-left">
                  <label className="block text-[9px] font-black text-zinc-400 mb-4 uppercase tracking-[0.4em]">SERVICE CATEGORY</label>
                  <select
                    className="w-full px-6 py-5 bg-zinc-50 border border-zinc-200 rounded focus:border-black outline-none transition-all font-black text-xs uppercase appearance-none cursor-pointer"
                    value={quoteForm.service}
                    onChange={(e) => setQuoteForm({ ...quoteForm, service: e.target.value })}
                  >
                    {SERVICES.map((s) => (
                      <option key={s.title} value={s.title}>
                        {s.title.toUpperCase()}
                      </option>
                    ))}
                    <option value="Other">OTHER / CUSTOM ARCHITECTURE</option>
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-[9px] font-black text-zinc-400 mb-4 uppercase tracking-[0.4em]">TECHNICAL SPECIFICATIONS</label>
                  <textarea
                    required
                    className="w-full px-6 py-5 bg-zinc-50 border border-zinc-200 rounded focus:border-black outline-none transition-all min-h-[180px] font-black text-xs tracking-tight"
                    placeholder="DIMENSIONS, CURRENT GROUND COMPOSITION, DRAINAGE ACCESS..."
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                  />
                </div>

                <div className="text-left">
                  <label className="block text-[9px] font-black text-zinc-400 mb-4 uppercase tracking-[0.4em]">
                    SITE PHOTOS (OPTIONAL)
                  </label>
                  <p className="text-[10px] font-bold text-zinc-500 mb-4 tracking-tight">
                    Take new photos or choose from your gallery — multiple files allowed.
                  </p>
                  <label className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white font-black text-[10px] tracking-[0.3em] rounded cursor-pointer hover:bg-black transition-colors">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files || []);
                        setQuoteFiles((prev) => [...prev, ...picked].slice(0, MAX_QUOTE_PHOTOS));
                        e.target.value = '';
                      }}
                    />
                    ADD / TAKE PHOTOS
                  </label>
                  {quoteFiles.length > 0 && (
                    <ul className="mt-6 space-y-2 text-left">
                      {quoteFiles.map((f, idx) => (
                        <li
                          key={`${f.name}-${idx}-${f.lastModified}`}
                          className="flex items-center justify-between gap-4 text-[10px] font-black tracking-widest text-zinc-600 border border-zinc-200 rounded px-4 py-3 bg-zinc-50"
                        >
                          <span className="truncate">{f.name}</span>
                          <button
                            type="button"
                            className="text-zinc-400 hover:text-red-600 shrink-0"
                            onClick={() => setQuoteFiles((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            REMOVE
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white font-black py-7 rounded text-[11px] tracking-[0.5em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-black/20"
                >
                  SUBMIT SPECIFICATIONS <ArrowRight size={20} />
                </button>
                {status.msg && (
                  <p className={`text-center font-black text-[10px] tracking-[0.3em] mt-8 ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {status.msg.toUpperCase()}
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-black text-white py-20 border-t border-zinc-900 flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid md:grid-cols-12 gap-16 md:gap-24 mb-16 text-center md:text-left">
            <div className="md:col-span-6 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-white rounded flex items-center justify-center text-black font-black text-3xl shadow-lg">S</div>
                <span className="font-black text-4xl tracking-tighter">
                  S.W.M <span className="text-zinc-600">GROUNDSWORKS</span>
                </span>
              </div>
              <p className="text-zinc-500 max-w-md mb-10 leading-relaxed font-bold tracking-tight text-lg">
                Elite groundworking specialists serving the Northwest, Wirral, Merseyside, and Stoke-on-Trent. Luxury driveways, foundations, and structural landscaping.
              </p>
              <div className="flex gap-8">
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-all transform hover:scale-110">
                  <FacebookIcon size={24} />
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-all transform hover:scale-110">
                  <InstagramIcon size={24} />
                </a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-all transform hover:scale-110">
                  <TikTokIcon size={24} />
                </a>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col items-center md:items-start">
              <h4 className="font-black text-[10px] tracking-[0.4em] uppercase mb-8 text-zinc-600">PRIMARY CONTACT</h4>
              <ul className="space-y-6 text-sm font-black tracking-widest">
                <li className="flex flex-col md:flex-row items-center gap-4 text-zinc-300">
                  <Smartphone size={18} className="text-zinc-700" /> 07375 996 207
                </li>
                <li className="flex flex-col md:flex-row items-center gap-4 text-zinc-300">
                  <Mail size={18} className="text-zinc-700" /> SWM@GROUNDSWORKS.COM
                </li>
                <li className="flex flex-col md:flex-row items-center gap-4 text-zinc-300">
                  <MapPin size={18} className="text-zinc-700" /> NW UK & STOKE-ON-TRENT
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 flex flex-col items-center md:items-start">
              <h4 className="font-black text-[10px] tracking-[0.4em] uppercase mb-8 text-zinc-600">OPERATIONAL HOURS</h4>
              <ul className="space-y-4 text-[10px] font-black tracking-[0.3em] text-zinc-500 w-full max-w-[200px]">
                <li className="flex justify-between border-b border-zinc-900/50 pb-2">
                  <span>MON — FRI</span> <span className="text-white">08:00 - 17:00</span>
                </li>
                <li className="flex justify-between border-b border-zinc-900/50 pb-2">
                  <span>SATURDAY</span> <span className="text-white">09:00 - 13:00</span>
                </li>
                <li className="flex justify-between">
                  <span>SUNDAY</span> <span className="text-zinc-800">CLOSED</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900 flex justify-center">
            <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-black tracking-[0.3em] text-zinc-700">
              <p className="uppercase">© {new Date().getFullYear()} S.W.M GROUNDSWORKS. ALL INFRASTRUCTURE RESERVED.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors uppercase">
                  PRIVACY POLICY
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
