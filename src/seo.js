import { BLOG_POSTS } from './data/blogPosts.js';

const SITE_URL = 'https://swm-groundworks.co.uk/';
const DEFAULT_TITLE =
  'S.W.M Groundworks | Groundworks, Excavations & Dig Outs | Wirral, Liverpool, Cheshire & North West';
const DEFAULT_DESCRIPTION =
  'North West groundworks specialists — excavations, dig outs, driveways, foundations, fencing, patios, landscaping and drainage across Wirral, Liverpool, Merseyside, Cheshire and North Wales. Fully insured. Free quotes.';

const TAB_SEO = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  services: {
    title: 'Groundworks Services | Excavations, Dig Outs, Driveways & Foundations | S.W.M Groundworks',
    description:
      'Driveways, excavations, dig outs, foundations, fencing, patios, landscaping, drainage, extensions and site clearance across the North West. Wirral, Liverpool, Cheshire and North Wales.',
  },
  work: {
    title: 'Our Work | Groundworks Projects Wirral & North West | S.W.M Groundworks',
    description:
      'Before-and-after groundworks, driveways, patios, gardens, extensions, foundations and fencing completed across Wirral, Liverpool, Merseyside, Cheshire and North Wales.',
  },
  reviews: {
    title: 'Customer Reviews | S.W.M Groundworks North West',
    description:
      'Five-star groundworks reviews from homeowners across Wirral, Liverpool, Cheshire and North Wales — driveways, fencing, landscaping and drainage.',
  },
  blog: {
    title: 'Groundworks Blog | Tips for Wirral, Liverpool & Cheshire | S.W.M Groundworks',
    description:
      'Practical groundworks advice — drainage, driveways, excavations, fencing, patios and foundations for homes across Merseyside, Cheshire and North Wales.',
  },
  visualise: {
    title: 'Garden Visualiser | Preview Paving & Turf in Your Garden | S.W.M Groundworks',
    description:
      'Free camera preview — see Raj Green sandstone, Kandla Grey, porcelain, block paving and artificial turf in your garden before you request a quote. North West groundworks.',
  },
  quote: {
    title: 'Request a Quote | Groundworks & Excavations | S.W.M Groundworks',
    description:
      'Request a free groundworks quote for driveways, dig outs, excavations, foundations, fencing, patios or landscaping. Wirral, Liverpool, Cheshire and North Wales.',
  },
};

const SEO_SERVICES = [
  'Groundworks',
  'Excavations',
  'Dig outs',
  'Site clearance',
  'Driveways',
  'Block paving',
  'Resin-bound driveways',
  'Patios and paving',
  'Indian sandstone',
  'Fencing and gates',
  'Landscaping',
  'Garden drainage',
  'Foundations and footings',
  'Concrete dig outs',
  'Extension groundworks',
  'Dropped kerbs',
  'Retaining walls',
  'Porches',
];

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applyPageSeo({ activeTab, blogSlug }) {
  const post = blogSlug ? BLOG_POSTS.find((p) => p.slug === blogSlug) : null;
  const tab = TAB_SEO[activeTab] || TAB_SEO.home;

  const title = post ? `${post.title} | S.W.M Groundworks Blog` : tab.title;
  const description = post
    ? `${post.excerpt} Groundworks advice from S.W.M Groundworks — Wirral, Liverpool, Cheshire and North Wales.`
    : tab.description;

  document.title = title;
  setMeta('description', description);
  setMeta('og:title', title, 'property');
  setMeta('og:description', description, 'property');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
}

export function injectSupplementalStructuredData() {
  const id = 'swm-supplemental-ld-json';
  if (document.getElementById(id)) return;

  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'S.W.M Groundworks',
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'en-GB',
        publisher: { '@id': `${SITE_URL}#business` },
      },
      {
        '@type': 'Blog',
        '@id': `${SITE_URL}#blog`,
        name: 'S.W.M Groundworks Blog',
        description: 'Groundworks, excavations and landscaping notes for the North West.',
        blogPost: BLOG_POSTS.map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          author: { '@type': 'Organization', name: 'S.W.M Groundworks' },
          keywords: SEO_SERVICES.slice(0, 8).join(', '),
        })),
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}#services`,
        name: 'S.W.M Groundworks services',
        itemListElement: SEO_SERVICES.map((name, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Service',
            name,
            provider: { '@id': `${SITE_URL}#business` },
            areaServed: 'North West England and North Wales',
          },
        })),
      },
    ],
  };

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(payload);
  document.head.appendChild(script);
}
