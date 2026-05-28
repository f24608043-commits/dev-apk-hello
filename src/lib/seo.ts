type SeoInput = {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  ogType?: string;
};

function ensureMetaTag(selector: string, create: () => HTMLMetaElement) {
  const existing = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (existing) return existing;
  const el = create();
  document.head.appendChild(el);
  return el;
}

export function setSeoTags(input: SeoInput) {
  if (typeof document === 'undefined') return;

  const titleTag = input.title;
  if (titleTag) document.title = titleTag;

  const desc = input.description || '';

  // Standard meta description
  const metaDesc = ensureMetaTag('meta[name="description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    return m;
  });
  metaDesc.setAttribute('content', desc);

  // OpenGraph
  const ogTitle = ensureMetaTag('meta[property="og:title"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:title');
    return m;
  });
  ogTitle.setAttribute('content', input.title);

  const ogDescription = ensureMetaTag('meta[property="og:description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:description');
    return m;
  });
  ogDescription.setAttribute('content', desc);

  const ogType = input.ogType || 'website';
  const ogTypeTag = ensureMetaTag('meta[property="og:type"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:type');
    return m;
  });
  ogTypeTag.setAttribute('content', ogType);

  const ogSiteName = ensureMetaTag('meta[property="og:site_name"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:site_name');
    return m;
  });
  ogSiteName.setAttribute('content', 'Badshah Di Hatti');

  const ogImage = ensureMetaTag('meta[property="og:image"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:image');
    return m;
  });
  ogImage.setAttribute('content', input.ogImageUrl || '/images/herobanner1.png');

  // Twitter
  const twCard = ensureMetaTag('meta[name="twitter:card"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'twitter:card');
    return m;
  });
  twCard.setAttribute('content', 'summary_large_image');

  const twTitle = ensureMetaTag('meta[name="twitter:title"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'twitter:title');
    return m;
  });
  twTitle.setAttribute('content', input.title);

  const twDesc = ensureMetaTag('meta[name="twitter:description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'twitter:description');
    return m;
  });
  twDesc.setAttribute('content', desc);

  const twImage = ensureMetaTag('meta[name="twitter:image"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'twitter:image');
    return m;
  });
  twImage.setAttribute('content', input.ogImageUrl || '/images/herobanner1.png');

  // Canonical (optional)
  if (input.canonicalUrl) {
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', input.canonicalUrl);
  }
}

