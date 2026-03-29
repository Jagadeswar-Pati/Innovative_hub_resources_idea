/**
 * SEO utilities: base URL and document head updates for title, meta, OG, Twitter, canonical.
 * Brand: Innovative Hub | Domain: https://inovative-hub.com
 */

import { BRAND_LOGO } from '@/constants/media';

const SITE_NAME = 'Innovative Hub';
const DEFAULT_TITLE = SITE_NAME;
/** Brand-first meta for homepage and default. */
const DEFAULT_DESCRIPTION = 'Innovative Hub is Odisha\'s leading platform for robotics, IoT & embedded systems. Components, kits & tutorials for engineering students and makers.';
const DEFAULT_OG_IMAGE = BRAND_LOGO;

/** Base URL for canonical and OG (absolute). No trailing slash. */
export function getBaseUrl(): string {
  if (typeof import.meta.env.VITE_APP_URL === 'string' && import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'https://inovative-hub.com';
}

export interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  /** Path (e.g. /about). Canonical and og:url will be baseUrl + path */
  path?: string;
  /** e.g. "website" or "article" for product pages */
  ogType?: string;
  /** If true, do not set any meta (e.g. for auth/checkout pages that may be noindex later) */
  noIndex?: boolean;
}

function ensureMeta(nameOrProperty: string, isProperty: boolean): HTMLMetaElement {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${nameOrProperty}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProperty);
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(nameOrProperty: string, content: string, isProperty: boolean): void {
  const el = ensureMeta(nameOrProperty, isProperty);
  el.setAttribute('content', content);
}

/**
 * Update document head: title, description, og:*, twitter:*, canonical.
 * Call from a useEffect in each page component.
 */
export function updateDocumentHead(options: SEOOptions): void {
  const {
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_OG_IMAGE,
    path = '',
    ogType = 'website',
    noIndex = false,
  } = options;

  const baseUrl = getBaseUrl();
  const canonicalUrl = path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`;

  // Browser tab always shows brand only (previous behavior: "Innovative Hub" only)
  document.title = SITE_NAME;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  setMeta('description', description, false);
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', description, true);
  setMeta('og:image', imageUrl, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:type', ogType, true);
  setMeta('og:site_name', SITE_NAME, true);

  setMeta('twitter:card', 'summary_large_image', false);
  setMeta('twitter:title', fullTitle, false);
  setMeta('twitter:description', description, false);
  setMeta('twitter:image', imageUrl, false);

  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.href = canonicalUrl;

  if (noIndex) {
    setMeta('robots', 'noindex, nofollow', false);
  } else {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.remove();
  }
}
