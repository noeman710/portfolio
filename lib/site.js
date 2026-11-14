// One place for the public address (used by metadata, sitemap and robots).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://icon-portfolio-indol.vercel.app');

export const OG_IMAGE = { url: '/assets/images/portrait.jpg', width: 900, height: 900, alt: 'Noemane El Afia' };
