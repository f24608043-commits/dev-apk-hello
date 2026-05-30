/**
 * Comprehensive SEO Utilities for Badshah Di Hatti
 * Handles metadata generation, schema markup, and SEO optimizations
 */

// ============================================================================
// 1. METADATA TYPES & INTERFACES
// ============================================================================

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  author?: string;
  language?: string;
}

export interface ProductSEO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_1?: string;
  category_id?: string;
  brand_id?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  urduName?: string;
  romanUrduName?: string;
}

export interface CategorySEO {
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  image?: string;
  urduName?: string;
  romanUrduName?: string;
}

// ============================================================================
// 2. KEYWORD OPTIMIZATION
// ============================================================================

export const KEYWORD_MAPPING = {
  homepage: {
    primary: ['herbal medicines Pakistan', 'tibbi products online', 'unani medicines', 'herbal store Pakistan'],
    secondary: ['natural wellness products', 'herbal remedies', 'bulk herbal suppliers', 'authentic tibb solutions'],
    urdu: ['ہربل ادویات', 'تیب دوائیں', 'جڑی بوٹیوں کی ادویات'],
    romanUrdu: ['herbal duaa', 'tibi dawain', 'jariy botiyon ki dawain'],
  },
  categories: {
    beauty: {
      primary: ['herbal beauty products Pakistan', 'natural beauty remedies'],
      urdu: ['جڑی بوٹیوں کی خوبصورتی'],
    },
    fitness: {
      primary: ['herbal fitness supplements', 'natural energy supplements Pakistan'],
      urdu: ['فٹنس سپلیمنٹس'],
    },
    herbalSolution: {
      primary: ['herbal health solutions', 'natural remedies Pakistan'],
      urdu: ['ہربل حل'],
    },
    majoonat: {
      primary: ['majoonat Pakistan', 'herbal pastes', 'traditional herbal remedies'],
      urdu: ['معجونات'],
    },
  },
};

// ============================================================================
// 3. SEO TITLE GENERATORS
// ============================================================================

export const generateProductTitle = (
  productName: string,
  category?: string,
  inclusion: 'price' | 'stock' | 'none' = 'none'
): string => {
  const maxLength = 60;
  let title = `${productName} - Authentic Herbal Medicine in Pakistan`;
  
  if (category) {
    title = `${productName} | ${category} | Badshah Di Hatti Pakistan`;
  }
  
  if (title.length > maxLength) {
    title = title.substring(0, maxLength - 3) + '...';
  }
  
  return title;
};

export const generateCategoryTitle = (categoryName: string): string => {
  const maxLength = 60;
  let title = `${categoryName} | Buy Online at Badshah Di Hatti Pakistan`;
  
  if (title.length > maxLength) {
    title = title.substring(0, maxLength - 3) + '...';
  }
  
  return title;
};

export const generateHomepageTitle = (): string => {
  return 'Badshah Di Hatti - #1 Wholesale Herbal & Tibbi Medicine Supplier Pakistan';
};

// ============================================================================
// 4. SEO META DESCRIPTION GENERATORS
// ============================================================================

export const generateProductDescription = (
  productName: string,
  category?: string,
  benefits?: string[],
  urduName?: string
): string => {
  const maxLength = 160;
  
  let description = `Buy authentic ${productName} from Badshah Di Hatti - Pakistan's trusted herbal medicine supplier.`;
  
  if (category) {
    description += ` Premium ${category.toLowerCase()} products at wholesale prices.`;
  }
  
  if (benefits && benefits.length > 0) {
    description += ` Benefits: ${benefits.slice(0, 2).join(', ')}.`;
  }
  
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...';
  }
  
  return description;
};

export const generateCategoryDescription = (categoryName: string, productCount: number): string => {
  const maxLength = 160;
  let description = `Shop ${productCount}+ authentic ${categoryName} products at Badshah Di Hatti. Premium herbal solutions, wholesale prices, trusted by Pakistani customers.`;
  
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...';
  }
  
  return description;
};

export const generateHomepageDescription = (): string => {
  return 'Badshah Di Hatti - Exclusive wholesale supplier of authentic herbal medicines, Tibbi products, Unani remedies, and natural wellness solutions in Pakistan. Bulk orders welcome.';
};

// ============================================================================
// 5. URL SLUG OPTIMIZATION
// ============================================================================

export const generateProductSlug = (productName: string, productId?: string): string => {
  let slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  // Add Pakistan keyword for better local SEO
  slug = `${slug}-pakistan`;
  
  // Optionally add product ID for uniqueness
  if (productId) {
    slug = `${slug}-${productId.substring(0, 8)}`;
  }
  
  return slug;
};

export const generateCategorySlug = (categoryName: string): string => {
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============================================================================
// 6. IMAGE ALT TEXT OPTIMIZATION
// ============================================================================

export const generateImageAlt = (
  productName: string,
  imageNumber: 1 | 2 | 3 = 1,
  category?: string
): string => {
  const positions = ['front', 'back', 'side'];
  const position = positions[imageNumber - 1] || 'product';
  const categoryText = category ? ` | ${category}` : '';
  
  return `${productName} - ${position} view herbal medicine Pakistan${categoryText}`;
};

// ============================================================================
// 7. BREADCRUMB GENERATION
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  path: string;
  schema?: boolean;
}

export const generateProductBreadcrumbs = (
  categoryName: string,
  categorySlug: string,
  productName: string,
  productSlug: string
): BreadcrumbItem[] => {
  return [
    { label: 'Home', path: '/', schema: true },
    { label: 'Shop', path: '/shop', schema: true },
    { label: categoryName, path: `/shop?category=${categorySlug}`, schema: true },
    { label: productName, path: `/product/${productSlug}`, schema: true },
  ];
};

export const generateCategoryBreadcrumbs = (categoryName: string, categorySlug: string): BreadcrumbItem[] => {
  return [
    { label: 'Home', path: '/', schema: true },
    { label: 'Shop', path: '/shop', schema: true },
    { label: categoryName, path: `/shop?category=${categorySlug}`, schema: true },
  ];
};

// ============================================================================
// 8. SET META TAGS DYNAMICALLY
// ============================================================================

export const setMetaTags = (metadata: SEOMetadata, baseUrl: string = 'https://devapk.com'): void => {
  // Update title
  document.title = metadata.title;

  // Helper function to set meta tag
  const setMeta = (name: string, content: string, property = false) => {
    let element = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(property ? 'property' : 'name', name);
      document.head.appendChild(element);
    }
    element.content = content;
  };

  // Basic SEO meta tags
  setMeta('description', metadata.description);
  setMeta('keywords', metadata.keywords.join(', '));
  setMeta('author', metadata.author || 'Badshah Di Hatti');
  setMeta('robots', metadata.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  setMeta('language', metadata.language || 'en');

  // Canonical URL
  if (metadata.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = metadata.canonical.startsWith('http') ? metadata.canonical : `${baseUrl}${metadata.canonical}`;
  }

  // Open Graph tags
  setMeta('og:title', metadata.ogTitle || metadata.title, true);
  setMeta('og:description', metadata.ogDescription || metadata.description, true);
  setMeta('og:type', metadata.ogType || 'website', true);
  setMeta('og:url', metadata.canonical || baseUrl, true);
  if (metadata.ogImage) {
    setMeta('og:image', metadata.ogImage, true);
  }

  // Twitter tags
  setMeta('twitter:card', metadata.twitterCard || 'summary_large_image');
  setMeta('twitter:title', metadata.twitterTitle || metadata.title);
  setMeta('twitter:description', metadata.twitterDescription || metadata.description);
  if (metadata.twitterImage) {
    setMeta('twitter:image', metadata.twitterImage);
  }
};

// ============================================================================
// 9. SCHEMA MARKUP GENERATORS
// ============================================================================

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export const generateProductSchema = (product: ProductSEO, baseUrl: string = 'https://devapk.com'): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Authentic herbal medicine - ${product.name}`,
    image: product.image_1 || `${baseUrl}/placeholder.svg`,
    sku: product.id,
    url: `${baseUrl}/product/${product.slug}`,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.price.toString(),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: (product.reviewCount || 0).toString(),
    } : undefined,
    brand: {
      '@type': 'Brand',
      name: 'Badshah Di Hatti',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Badshah Di Hatti',
      url: baseUrl,
    },
  };
};

export const generateOrganizationSchema = (baseUrl: string = 'https://devapk.com'): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Badshah Di Hatti',
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    description: 'Exclusive wholesale supplier of authentic herbal medicines and Tibbi products in Pakistan',
    foundingDate: '2023',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      telephone: '+92-300-2500026',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PK',
      addressRegion: 'Rawalpindi',
    },
    sameAs: [
      'https://wa.me/923002500026',
    ],
  };
};

export const generateBreadcrumbSchema = (items: BreadcrumbItem[], baseUrl: string = 'https://devapk.com'): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: (index + 1).toString(),
      name: item.label,
      item: item.path.startsWith('http') ? item.path : `${baseUrl}${item.path}`,
    })),
  };
};

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

export const generateWebsiteSchema = (baseUrl: string = 'https://devapk.com'): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Badshah Di Hatti',
    url: baseUrl,
    description: 'Exclusive wholesale supplier of authentic herbal medicines in Pakistan',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/shop?q={search_term_string}`,
      },
      query_input: 'required name=search_term_string',
    },
  };
};

// ============================================================================
// 10. INTERNAL LINKING STRATEGY
// ============================================================================

export interface InternalLink {
  text: string;
  path: string;
  context?: string;
}

export const getRelatedProductLinks = (
  productCategory: string,
  currentProductId: string,
  products: ProductSEO[]
): InternalLink[] => {
  return products
    .filter((p) => p.category_id === productCategory && p.id !== currentProductId)
    .slice(0, 3)
    .map((p) => ({
      text: p.name,
      path: `/product/${p.slug}`,
      context: 'related',
    }));
};

export const getCategoryLinks = (): InternalLink[] => {
  return [
    { text: 'Beauty Products', path: '/shop?category=beauty', context: 'category' },
    { text: 'Fitness Supplements', path: '/shop?category=fitness', context: 'category' },
    { text: 'Herbal Solutions', path: '/shop?category=herbal-solution', context: 'category' },
    { text: 'Majoonat', path: '/shop?category=majoonat', context: 'category' },
  ];
};

// ============================================================================
// 11. ROBOTS.TXT & SITEMAP HELPERS
// ============================================================================

export const generateRobotsTxt = (baseUrl: string = 'https://devapk.com'): string => {
  return `# Badshah Di Hatti Robots.txt
User-agent: *
Allow: /
Allow: /product/
Allow: /shop
Allow: /blog
Allow: /about
Allow: /contact
Disallow: /admin
Disallow: /checkout
Disallow: /account
Disallow: /*.json$
Disallow: /*?*sort=
Disallow: /*?*filter=

# Crawl delay
Crawl-delay: 1

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-products.xml
Sitemap: ${baseUrl}/sitemap-categories.xml
Sitemap: ${baseUrl}/sitemap-blog.xml`;
};

export const generateSitemapIndex = (baseUrl: string = 'https://devapk.com'): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-main.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-products.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
  </sitemap>
</sitemapindex>`;
};

// ============================================================================
// 12. CORE WEB VITALS OPTIMIZATION HELPERS
// ============================================================================

export const optimizeImageForWeb = (
  imagePath: string,
  filename: string,
  format: 'webp' | 'jpg' | 'png' = 'webp'
): string => {
  // Helper to generate optimized image paths
  const baseFilename = filename.replace(/\.[^/.]+$/, '');
  return `${imagePath}/${baseFilename}-optimized.${format}`;
};

// ============================================================================
// 13. CONTENT OPTIMIZATION HELPERS
// ============================================================================

export const generateProductIntroduction = (
  productName: string,
  category: string,
  benefits: string[]
): string => {
  return `${productName} is a premium ${category.toLowerCase()} product from Badshah Di Hatti, Pakistan's trusted supplier of authentic herbal medicines. 

This traditional remedy provides numerous benefits including ${benefits.slice(0, 3).join(', ')}. Our ${productName} is sourced from the finest natural ingredients and prepared using time-tested methods to ensure maximum effectiveness and purity.

At Badshah Di Hatti, we specialize in wholesale distribution of authentic Tibbi and herbal products throughout Pakistan. Every product undergoes strict quality control to meet international standards.`;
};

// ============================================================================
// 14. SEO TESTING UTILITIES
// ============================================================================

export const validateProductMetadata = (metadata: SEOMetadata): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.length < 20) {
    errors.push('Title should be at least 20 characters');
  }
  if (metadata.title && metadata.title.length > 70) {
    errors.push('Title should not exceed 70 characters');
  }
  if (!metadata.description || metadata.description.length < 50) {
    errors.push('Description should be at least 50 characters');
  }
  if (metadata.description && metadata.description.length > 160) {
    errors.push('Description should not exceed 160 characters');
  }
  if (!metadata.keywords || metadata.keywords.length === 0) {
    errors.push('Add at least 1 keyword');
  }
  if (metadata.keywords && metadata.keywords.length > 10) {
    errors.push('Keep keywords to 10 or fewer');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  generateProductTitle,
  generateCategoryTitle,
  generateHomepageTitle,
  generateProductDescription,
  generateCategoryDescription,
  generateHomepageDescription,
  generateProductSlug,
  generateCategorySlug,
  generateImageAlt,
  generateProductBreadcrumbs,
  generateCategoryBreadcrumbs,
  setMetaTags,
  generateProductSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateWebsiteSchema,
  getRelatedProductLinks,
  getCategoryLinks,
  generateRobotsTxt,
  generateSitemapIndex,
  optimizeImageForWeb,
  generateProductIntroduction,
  validateProductMetadata,
};
