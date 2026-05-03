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
  ChevronLeft,
  Car,
  LayoutGrid,
  Fence,
  Trees,
  Droplets,
  Landmark,
  Play,
} from 'lucide-react';
import { BLOG_POSTS } from './data/blogPosts.js';

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
const LOCATIONS = [
  'Wirral',
  'Merseyside',
  'Cheshire',
  'Liverpool',
  'North Wales',
  'West Kirby',
  'Chester',
  'Ellesmere Port',
  'Wallasey',
  'Neston',
];

/** Display-only client feedback (in-page). Not emitted as structured data for search engines. */
const STATIC_CLIENT_REVIEWS = [
  {
    id: 'sr-1',
    isApproved: true,
    rating: 5,
    reviewedAt: '2015-03-12',
    author: 'James M.',
    location: 'Bromborough, Wirral',
    jobType: 'Block paving driveway',
    text: "We had the front completely dug out and redone. The lads turned up when they said they would, left the street tidy every night, and the finish on the paving is spot on. Neighbours have already asked who did it.",
  },
  {
    id: 'sr-2',
    isApproved: true,
    rating: 5,
    reviewedAt: '2018-07-22',
    author: 'Sarah T.',
    location: 'Heswall, Wirral',
    jobType: 'Porcelain patio',
    text: "Proper fussy about levels and drainage — they took the time to explain everything in plain English. Patio’s been through two winters now and still looks brand new. Wouldn’t hesitate to recommend.",
  },
  {
    id: 'sr-3',
    isApproved: true,
    rating: 5,
    reviewedAt: '2014-11-08',
    author: 'David L.',
    location: 'Birkenhead, Merseyside',
    jobType: 'Close-board fencing',
    text: "Solid posts, straight lines, and no cutting corners on the gravel boards. You can tell they’ve done this for years. Fair price for what we got.",
  },
  {
    id: 'sr-4',
    isApproved: true,
    rating: 5,
    reviewedAt: '2019-02-19',
    author: 'Emma W.',
    location: 'Wallasey, Merseyside',
    jobType: 'Garden landscaping',
    text: "Our back garden was a mud bath after the last lot left it half finished. S.W.M came in, sorted the levels, new turf and sleepers — honestly feels like a different house. Chuffed to bits.",
  },
  {
    id: 'sr-5',
    isApproved: true,
    rating: 5,
    reviewedAt: '2016-09-30',
    author: 'Michael P.',
    location: 'Crosby, Merseyside',
    jobType: 'Driveway & dropped kerb',
    text: "Coordinated with the council side of things without us having to chase. Drive went in quicker than we expected and the detail round the inspection chamber is neat as a pin.",
  },
  {
    id: 'sr-6',
    isApproved: true,
    rating: 5,
    reviewedAt: '2020-04-05',
    author: 'Rachel H.',
    location: 'Chester, Cheshire',
    jobType: 'Indian stone paving',
    text: "We wanted something that would suit an older property without looking dated. The pointing and cuts round the bay are lovely — you can tell it wasn’t rushed.",
  },
  {
    id: 'sr-7',
    isApproved: true,
    rating: 5,
    reviewedAt: '2022-11-14',
    author: 'Tom G.',
    location: 'Ellesmere Port, Cheshire',
    jobType: 'Resin-bound driveway',
    text: "No mess, no drama. They protected the front step and the bay window like their own. Finish is dead even — no puddles after heavy rain either.",
  },
  {
    id: 'sr-8',
    isApproved: true,
    rating: 5,
    reviewedAt: '2017-12-01',
    author: 'Linda K.',
    location: 'Prenton, Wirral',
    jobType: 'Featheredge fencing',
    text: "Quiet, professional crew. I work from home and barely knew they were there apart from seeing the fence go up. Gate shuts first time every time — small thing but it matters.",
  },
  {
    id: 'sr-9',
    isApproved: true,
    rating: 5,
    reviewedAt: '2024-06-18',
    author: 'Chris O.',
    location: 'Aigburth, Liverpool',
    jobType: 'Landscaping & drainage',
    text: "We were getting water sitting against the house after storms. They regraded, put proper falls in and tied into existing gullies. Touch wood, it’s been dry since. Top job.",
  },
  {
    id: 'sr-10',
    isApproved: true,
    rating: 5,
    reviewedAt: '2021-08-25',
    author: 'Anna N.',
    location: 'Neston, Cheshire',
    jobType: 'Double driveway & gates',
    text: "From quote to completion they were straight with us on costs and timescales. The automated gates line up perfectly with the new pillars — looks really smart.",
  },
  {
    id: 'sr-11',
    isApproved: true,
    rating: 5,
    reviewedAt: '2014-06-20',
    author: 'Gareth J.',
    location: 'Mold, Flintshire',
    jobType: 'Patio & paths',
    text: "We’re a bit out of the way but they still made the trip for snagging without quibble. Welsh slate paths look cracking against the render — proper craftsmanship.",
  },
  {
    id: 'sr-12',
    isApproved: true,
    rating: 5,
    reviewedAt: '2025-10-03',
    author: 'Karen S.',
    location: 'West Kirby, Wirral',
    jobType: 'Full rear garden',
    text: "Kids and dog were doing my head in with mud. New lawn, sleeper beds and a proper path to the shed — it’s actually usable now. Thanks again for sorting it before the summer holidays.",
  },
];

function formatLongDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** First garden before/after reel — add MP4 at public/videos/garden-transformation-01.mp4 (see public/videos/README.txt). */
const GARDEN_TRANSFORMATION_VIDEO_SRC = '/videos/garden-transformation-01.mp4';
const GARDEN_TRANSFORMATION_POSTER = '/images/garden pic 3.jpeg';

function GardenTransformationSection() {
  const [videoAvailable, setVideoAvailable] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GARDEN_TRANSFORMATION_VIDEO_SRC, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) setVideoAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setVideoAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-zinc-950 py-20 md:py-28 text-white border-y border-zinc-800">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.45em] text-zinc-500">On the ground</h2>
        <h3 className="mb-4 text-3xl font-black tracking-tighter text-white sm:text-4xl md:text-5xl">Garden transformation</h3>
        <p className="mx-auto mb-10 max-w-xl text-sm font-medium leading-relaxed text-zinc-400">
          Before-and-after walkthrough on one reel — sits on the home page above the stills gallery so visitors see scale
          and movement first.
        </p>
        <div className="relative mx-auto aspect-video max-h-[70vh] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl shadow-black/40">
          {videoAvailable === true ? (
            <video
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster={GARDEN_TRANSFORMATION_POSTER}
            >
              <source src={GARDEN_TRANSFORMATION_VIDEO_SRC} type="video/mp4" />
            </video>
          ) : (
            <>
              <img
                src={GARDEN_TRANSFORMATION_POSTER}
                alt="Garden project — video placeholder"
                className="h-full w-full object-cover opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/85 via-black/45 to-black/30 px-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm">
                  <Play size={28} className="ml-1 text-white" fill="white" aria-hidden />
                </div>
                <p className="max-w-md text-sm font-bold leading-relaxed text-white">
                  {videoAvailable === false
                    ? 'Upload your finished reel as MP4 to deploy it here — no code change needed.'
                    : 'Checking for video…'}
                </p>
                <p className="mt-3 max-w-lg text-xs font-semibold leading-relaxed text-zinc-400">
                  Save as <span className="font-mono text-zinc-300">public/videos/garden-transformation-01.mp4</span> then
                  redeploy (or refresh locally). See <span className="font-mono">public/videos/README.txt</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setVideoAvailable(null);
                    fetch(GARDEN_TRANSFORMATION_VIDEO_SRC, { method: 'HEAD' })
                      .then((res) => setVideoAvailable(res.ok))
                      .catch(() => setVideoAvailable(false));
                  }}
                  className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400 underline decoration-zinc-600 underline-offset-4 hover:text-white"
                >
                  I’ve added the file — check again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** workFilter must match a key in WORK_GALLERY (use "all" where there is no exact gallery tab). */
const SERVICES = [
  {
    title: 'Driveways',
    desc: 'Premium block paving, resin-bound, and decorative gravel driveways across the Wirral, Liverpool, Merseyside and Cheshire.',
    image: '/images/driveway pic.jpeg',
    workFilter: 'driveways',
    iconKey: 'driveways',
  },
  {
    title: 'Patios',
    desc: 'High-end porcelain and natural stone patio installations for luxury outdoor living.',
    image: '/images/tiles pic.jpeg',
    workFilter: 'patios',
    iconKey: 'patios',
  },
  {
    title: 'Fencing',
    desc: 'Commercial grade and decorative domestic fencing solutions built for durability.',
    image: '/images/fence pic.jpeg',
    workFilter: 'fencing',
    iconKey: 'fencing',
  },
  {
    title: 'Landscaping',
    desc: 'Complete architectural garden transformations and heavy-duty landscaping.',
    image: '/images/garden pic.jpeg',
    workFilter: 'gardens',
    iconKey: 'landscaping',
  },
  {
    title: 'Drainage',
    desc: 'Expert ground drainage solutions to prevent flooding and manage runoff.',
    image: '/images/garden pic 2.jpeg',
    workFilter: 'all',
    iconKey: 'drainage',
  },
  {
    title: 'Foundations',
    desc: 'Precision-engineered foundations and concrete footings for extensions and new builds.',
    image: '/images/steps 2.jpeg',
    workFilter: 'steps',
    iconKey: 'foundations',
  },
];

const SERVICE_ICON_MAP = {
  driveways: Car,
  patios: LayoutGrid,
  fencing: Fence,
  landscaping: Trees,
  drainage: Droplets,
  foundations: Landmark,
};

/** Review form: job type dropdown (matches core services + catch-all). */
const REVIEW_JOB_TYPE_OPTIONS = [...SERVICES.map((s) => s.title), 'Other / multiple'];

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
  const [reviews] = useState(STATIC_CLIENT_REVIEWS);
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
  const [reviewForm, setReviewForm] = useState({ author: '', jobType: '', rating: 5, text: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [workGalleryFilter, setWorkGalleryFilter] = useState('all');
  const [blogSlug, setBlogSlug] = useState(null);

  useEffect(() => {
    if (activeTab !== 'blog') setBlogSlug(null);
  }, [activeTab]);

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
      // Keeping your exact UX; can be wired to email / Sheets later if you want (include reviewForm.jobType then).
      setReviewForm({ author: '', jobType: '', rating: 5, text: '' });
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
                alt="S.W.M Groundworks logo"
                className="h-12 w-auto max-w-[120px] object-contain"
              />
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-xl tracking-tighter text-black">S.W.M</span>
                <span className="text-[10px] font-black tracking-[0.3em] text-zinc-400">GROUNDWORKS</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {['home', 'services', 'work', 'reviews', 'blog'].map((item) => (
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
          {['home', 'services', 'work', 'reviews', 'blog', 'quote'].map((item) => (
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
            alt="S.W.M Groundworks"
            className="h-44 sm:h-52 md:h-64 w-auto object-contain opacity-95 mix-blend-multiply [filter:contrast(1.05)_brightness(1.08)] drop-shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
          />
        </div>
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 rounded-full mb-10 text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-md">
          <ShieldCheck size={14} className="text-zinc-400" /> Groundworks Wirral, Liverpool, Cheshire & North Wales
        </div>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] mb-12 tracking-tighter max-w-5xl">
          STRUCTURAL <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 via-zinc-400 to-zinc-600">PERFECTION.</span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed mb-14 max-w-3xl font-medium px-4">
          The leading specialist in elite groundworks for the Wirral, Liverpool, Merseyside, Cheshire and North Wales. We build the foundations for your luxury projects.
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
    <section className="border-y border-zinc-200 bg-white py-16 text-black sm:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h3 className="mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 sm:mb-12">Areas of Operation</h3>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 sm:gap-x-12 sm:gap-y-8">
          {LOCATIONS.map((loc, i) => (
            <div
              key={i}
              className="flex cursor-default items-center gap-2 text-sm font-black tracking-widest text-black transition-colors hover:text-zinc-600"
            >
              <MapPin size={16} className="shrink-0 text-zinc-500" aria-hidden />
              {loc.toUpperCase()}
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
      beforeImgClass:
        'h-full w-full object-cover object-[50%_22%] scale-[1.22] transition-transform duration-700 group-hover:scale-[1.28]',
      afterImgClass:
        'h-full w-full object-cover object-[50%_26%] scale-[1.22] transition-transform duration-700 group-hover:scale-[1.28]',
    },
    {
      title: 'Garden',
      subtitle: 'Landscaping finish',
      beforeSrc: '/images/garden pic.jpeg',
      afterSrc: '/images/garden pic 3.jpeg',
    },
  ];

  /** Work tab + home gallery: category id → { label, images }. "all" is mixed order across projects. */
  const WORK_GALLERY = {
    all: {
      label: 'All work',
      images: [
        { src: '/images/fence pic.jpeg', alt: 'Fencing installation' },
        { src: '/images/driveway pic.jpeg', alt: 'Driveway' },
        { src: '/images/garden pic.jpeg', alt: 'Garden landscaping' },
        { src: '/images/gate pic .jpeg', alt: 'Gate' },
        { src: '/images/tarmac.jpeg', alt: 'Tarmac surface' },
        { src: '/images/porch pic.jpeg', alt: 'Porch' },
        {
          src: '/images/steps pic .jpeg',
          alt: 'Stone steps',
          imgClass: 'h-full w-full object-cover object-[50%_20%] scale-[1.3]',
        },
        { src: '/images/indian stone pic.jpeg', alt: 'Indian stone paving' },
        { src: '/images/garden pic 2.jpeg', alt: 'Garden' },
        { src: '/images/tiles pic.jpeg', alt: 'Patio tiling' },
        {
          src: '/images/steps 2.jpeg',
          alt: 'Steps detail',
          imgClass: 'h-full w-full object-cover object-[50%_24%] scale-[1.28]',
        },
        { src: '/images/tiles pic 2.jpeg', alt: 'Paving' },
        { src: '/images/garden pic 3.jpeg', alt: 'Landscaping' },
        { src: '/images/tiles pic 3.jpeg', alt: 'Patio tiles' },
      ],
    },
    fencing: {
      label: 'Fencing & gates',
      images: [
        { src: '/images/fence pic.jpeg', alt: 'Fencing' },
        { src: '/images/gate pic .jpeg', alt: 'Gate' },
      ],
    },
    driveways: {
      label: 'Driveways',
      images: [
        { src: '/images/driveway pic.jpeg', alt: 'Driveway' },
        { src: '/images/tarmac.jpeg', alt: 'Tarmac driveway' },
      ],
    },
    steps: {
      label: 'Steps & stonework',
      images: [
        {
          src: '/images/steps pic .jpeg',
          alt: 'Steps',
          imgClass: 'h-full w-full object-cover object-[50%_18%] scale-[1.32]',
        },
        {
          src: '/images/steps 2.jpeg',
          alt: 'Steps',
          imgClass: 'h-full w-full object-cover object-[50%_22%] scale-[1.3]',
        },
        { src: '/images/indian stone pic.jpeg', alt: 'Indian stone' },
      ],
    },
    gardens: {
      label: 'Gardens',
      images: [
        { src: '/images/garden pic.jpeg', alt: 'Garden' },
        { src: '/images/garden pic 2.jpeg', alt: 'Garden' },
        { src: '/images/garden pic 3.jpeg', alt: 'Garden' },
      ],
    },
    patios: {
      label: 'Patios & paving',
      images: [
        { src: '/images/tiles pic.jpeg', alt: 'Patio tiles' },
        { src: '/images/tiles pic 2.jpeg', alt: 'Paving' },
        { src: '/images/tiles pic 3.jpeg', alt: 'Patio' },
      ],
    },
    porches: {
      label: 'Porches',
      images: [{ src: '/images/porch pic.jpeg', alt: 'Porch' }],
    },
  };

  const WORK_GALLERY_ORDER = ['all', 'fencing', 'driveways', 'steps', 'gardens', 'patios', 'porches'];

  const Gallery = () => {
    const activeWork = WORK_GALLERY[workGalleryFilter] ?? WORK_GALLERY.all;

    return (
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h2 className="text-[10px] font-black tracking-[0.45em] text-zinc-400 uppercase mb-4">Portfolio</h2>
          <h3 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-10">Our work</h3>

          {workGalleryFilter === 'all' && (
            <div className="w-full max-w-5xl mb-14">
              <p className="text-[10px] font-black tracking-[0.35em] text-zinc-400 uppercase mb-8">Featured transformations</p>
              <div className="grid md:grid-cols-3 gap-8 md:gap-10 text-center">
                {PORTFOLIO_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="group bg-white rounded-lg overflow-hidden border border-zinc-200 shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <div className="grid grid-cols-2 h-52 sm:h-56">
                      <div className="relative bg-zinc-100 border-r border-zinc-200 overflow-hidden">
                        <img
                          src={item.beforeSrc}
                          alt={`${item.title} before`}
                          className={
                            item.beforeImgClass ??
                            'h-full w-full object-cover object-center scale-105 transition-transform duration-700 group-hover:scale-110'
                          }
                          loading="lazy"
                        />
                      </div>
                      <div className="relative bg-zinc-50 overflow-hidden">
                        <img
                          src={item.afterSrc}
                          alt={`${item.title} after`}
                          className={
                            item.afterImgClass ??
                            'h-full w-full object-cover object-center scale-105 transition-transform duration-700 group-hover:scale-110'
                          }
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="p-6 text-center">
                      <h4 className="font-black text-sm text-black tracking-tight">{item.title.toUpperCase()}</h4>
                      <p className="text-zinc-500 text-[9px] tracking-[0.25em] uppercase font-black mt-1">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] font-black tracking-[0.35em] text-zinc-400 uppercase mb-4">Browse by category</p>
          <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-3xl">
            {WORK_GALLERY_ORDER.map((id) => {
              const cat = WORK_GALLERY[id];
              const isOn = workGalleryFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setWorkGalleryFilter(id)}
                  className={`px-4 py-2.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase transition-colors border ${
                    isOn
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-black'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-wrap justify-center gap-3 sm:gap-4 max-w-5xl mx-auto">
            {activeWork.images.map((img) => (
              <div
                key={`${workGalleryFilter}-${img.src}`}
                className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.67rem)] max-w-[280px] aspect-square shrink-0 bg-zinc-100 border border-zinc-200 rounded-lg overflow-hidden"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className={img.imgClass ?? 'h-full w-full object-cover object-center'}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      <Nav />

      {activeTab === 'home' && (
        <>
          <Hero />
          <ServiceAreas />
          <GardenTransformationSection />
          <section className="border-b border-zinc-800 bg-black py-16 text-white sm:py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-10 text-center md:grid-cols-4 md:gap-12 lg:gap-16">
                {[
                  { label: 'Regional Experience', val: '22Y+' },
                  { label: 'Successful Projects', val: '500+' },
                  { label: 'Satisfaction Rate', val: '100%' },
                  { label: 'Insured Liability', val: '£5M' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="mb-2 text-4xl font-black tracking-tighter text-white sm:text-5xl md:text-[3.25rem]">{stat.val}</p>
                    <p className="px-2 text-[10px] font-bold uppercase leading-tight tracking-[0.3em] text-zinc-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <Gallery />
        </>
      )}

      {activeTab === 'services' && (
        <section className="py-20 md:py-28 bg-zinc-50/80 animate-in fade-in duration-1000 flex flex-col items-center border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full text-center">
            <h2 className="text-[10px] font-black tracking-[0.45em] text-zinc-400 uppercase mb-4">S.W.M Groundworks</h2>
            <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-tighter mb-4">Core services</h3>
            <p className="text-zinc-500 text-sm md:text-base font-medium max-w-2xl mx-auto mb-14 md:mb-16 leading-relaxed">
              Tap a service to open our work gallery on the matching category — driveways, patios, fencing, gardens and more.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {SERVICES.map((s) => {
                const Icon = SERVICE_ICON_MAP[s.iconKey] ?? CheckCircle2;
                return (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => {
                      setWorkGalleryFilter(s.workFilter);
                      setActiveTab('work');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-center shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden bg-zinc-200">
                      <img
                        src={s.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 transition-opacity duration-500 group-hover:from-black/80"
                        aria-hidden
                      />
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-lg ring-4 ring-white/40 transition-transform duration-500 group-hover:scale-110 group-hover:ring-white/60">
                          <Icon size={28} strokeWidth={1.75} className="shrink-0" aria-hidden />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col items-center px-6 pb-7 pt-8">
                      <h4 className="text-xl font-black tracking-tight text-black md:text-2xl">{s.title.toUpperCase()}</h4>
                      <p className="mt-4 max-w-sm text-sm font-semibold leading-relaxed text-zinc-600">{s.desc}</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400 transition-colors group-hover:text-black">
                        View work <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'work' && <Gallery />}

      {activeTab === 'reviews' && (
        <section className="border-b border-zinc-100 bg-gradient-to-b from-white via-white to-zinc-50/60 py-14 sm:py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-zinc-400">Verified Clients</p>
              <h2 className="text-4xl font-black leading-[0.95] tracking-tighter text-black sm:text-5xl md:text-6xl">
                CLIENT <br className="sm:hidden" />
                TRUST.
              </h2>
            </header>

            <div className="mx-auto mb-14 w-full max-w-lg text-center sm:mb-16 md:mb-20">
              <form
                onSubmit={handleReviewSubmit}
                className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm sm:p-8 md:p-10"
              >
                <h3 className="mb-6 text-center font-black text-xs uppercase tracking-[0.3em] text-black sm:mb-8">
                  SHARE YOUR EXPERIENCE
                </h3>
                <div className="space-y-5 sm:space-y-6">
                  <input
                    required
                    placeholder="FULL NAME"
                    className="w-full min-h-[48px] rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] outline-none transition-all placeholder:text-zinc-400 focus:border-black sm:px-5 sm:py-4"
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value.toUpperCase() })}
                  />
                  <label className="block">
                    <span className="sr-only">Job type</span>
                    <select
                      required
                      value={reviewForm.jobType}
                      onChange={(e) => setReviewForm({ ...reviewForm, jobType: e.target.value })}
                      className="w-full min-h-[48px] cursor-pointer rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] text-black outline-none transition-all focus:border-black sm:px-5 sm:py-4"
                    >
                      <option value="" disabled className="text-zinc-400">
                        JOB TYPE (WHAT WE DID)
                      </option>
                      {REVIEW_JOB_TYPE_OPTIONS.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3" role="group" aria-label="Star rating">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                        className={`min-h-[48px] min-w-[48px] rounded-md p-2 transition-colors touch-manipulation ${reviewForm.rating >= num ? 'text-black' : 'text-zinc-300'}`}
                      >
                        <Star size={24} className="mx-auto" fill={reviewForm.rating >= num ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    placeholder="DESCRIBE THE CRAFTSMANSHIP..."
                    className="min-h-[140px] w-full rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] outline-none transition-all placeholder:text-zinc-400 focus:border-black sm:px-5 sm:py-4"
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  />
                  <button
                    type="submit"
                    className="w-full min-h-[48px] rounded-lg bg-black py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white transition-colors hover:bg-zinc-800 touch-manipulation sm:py-5"
                  >
                    POST FEEDBACK
                  </button>
                  {status.msg && (
                    <p
                      className={`text-center text-[10px] font-black uppercase tracking-[0.2em] ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {status.msg.toUpperCase()}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {reviews.filter((r) => r.isApproved).length === 0 ? (
              <div className="mx-auto max-w-4xl rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-20 text-center sm:py-24">
                <p className="text-xs font-black uppercase tracking-[0.45em] text-zinc-300">Archiving feedback</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                {reviews
                  .filter((r) => r.isApproved)
                  .sort((a, b) => {
                    const ta = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
                    const tb = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
                    return tb - ta;
                  })
                  .map((r, i) => {
                    const parts = String(r.author || '')
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean);
                    const initials =
                      parts.length >= 2
                        ? `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
                        : (parts[0]?.slice(0, 2) || '?').toUpperCase();

                    return (
                      <article
                        key={r.id || i}
                        className="flex h-full min-h-0 flex-col rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-black text-white"
                            aria-hidden
                          >
                            {initials}
                          </div>
                          <div className="flex shrink-0 gap-0.5 pt-0.5" aria-label={`${r.rating} out of 5 stars`}>
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={15}
                                className={idx < r.rating ? 'fill-black text-black' : 'text-zinc-200'}
                                fill={idx < r.rating ? 'currentColor' : 'none'}
                                stroke="currentColor"
                              />
                            ))}
                          </div>
                        </div>
                        <blockquote className="min-h-0 flex-1 text-sm font-medium leading-relaxed text-zinc-800 [overflow-wrap:anywhere] sm:text-[15px]">
                          {r.text}
                        </blockquote>
                        <footer className="mt-4 border-t border-zinc-100 pt-3 text-left">
                          <p className="font-black text-sm text-black">{r.author}</p>
                          {r.reviewedAt && (
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">{formatLongDate(r.reviewedAt)}</p>
                          )}
                          <p className="mt-1.5 text-[10px] font-black uppercase leading-snug tracking-[0.18em] text-zinc-500 [overflow-wrap:anywhere]">
                            {r.location}
                            {r.jobType ? ` · ${r.jobType}` : ''}
                          </p>
                        </footer>
                      </article>
                    );
                  })}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'blog' && (
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
            {(() => {
              const sortedPosts = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
              const post = blogSlug ? sortedPosts.find((p) => p.slug === blogSlug) : null;

              if (blogSlug && !post) {
                return (
                  <div className="text-center">
                    <p className="text-zinc-500 font-bold text-sm mb-8">That article could not be found.</p>
                    <button
                      type="button"
                      onClick={() => setBlogSlug(null)}
                      className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase border border-black px-6 py-3 rounded hover:bg-black hover:text-white transition-colors"
                    >
                      <ChevronLeft size={16} /> Back to journal
                    </button>
                  </div>
                );
              }

              if (post) {
                return (
                  <article className="text-left">
                    <button
                      type="button"
                      onClick={() => setBlogSlug(null)}
                      className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 hover:text-black mb-10 transition-colors"
                    >
                      <ChevronLeft size={16} /> Journal
                    </button>
                    <p className="text-[10px] font-black tracking-[0.35em] text-zinc-400 uppercase mb-4">
                      {formatLongDate(post.date)}
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter mb-10 leading-tight">{post.title}</h1>
                    <div className="space-y-6 text-zinc-700 leading-relaxed text-base font-medium">
                      {post.paragraphs.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  </article>
                );
              }

              return (
                <div className="text-center">
                  <h2 className="text-[10px] font-black tracking-[0.45em] text-zinc-400 uppercase mb-4">Journal</h2>
                  <h3 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-4">Groundworks notes</h3>
                  <p className="text-zinc-500 text-sm font-medium max-w-xl mx-auto mb-14 leading-relaxed">
                    Practical notes from driveways, patios, fencing and drainage jobs across the Wirral, Liverpool, Cheshire and North Wales — add new posts in{' '}
                    <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">src/data/blogPosts.js</code>.
                  </p>
                  <ul className="space-y-4 text-left max-w-2xl mx-auto">
                    {sortedPosts.map((p) => (
                      <li key={p.slug}>
                        <button
                          type="button"
                          onClick={() => setBlogSlug(p.slug)}
                          className="w-full text-left group rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 hover:shadow-md transition-all px-6 py-5"
                        >
                          <p className="text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase mb-2">
                            {formatLongDate(p.date)}
                          </p>
                          <h4 className="font-black text-lg text-black tracking-tight group-hover:underline decoration-2 underline-offset-4">
                            {p.title}
                          </h4>
                          <p className="text-sm text-zinc-600 mt-2 leading-snug font-medium">{p.excerpt}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
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
                  S.W.M <span className="text-zinc-600">GROUNDWORKS</span>
                </span>
              </div>
              <p className="text-zinc-500 max-w-md mb-10 leading-relaxed font-bold tracking-tight text-lg">
                Elite groundworks across the Wirral, Liverpool, Merseyside, Cheshire and North Wales — driveways, fencing, patios, landscaping, drainage and foundations. Fully insured.
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
                  <Mail size={18} className="text-zinc-700" /> SWM@GROUNDWORKS.COM
                </li>
                <li className="flex flex-col md:flex-row items-center gap-4 text-zinc-300">
                  <MapPin size={18} className="text-zinc-700" /> WIRRAL · LIVERPOOL · CHESHIRE · NORTH WALES
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
              <p className="uppercase">© {new Date().getFullYear()} S.W.M GROUNDWORKS. ALL INFRASTRUCTURE RESERVED.</p>
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
