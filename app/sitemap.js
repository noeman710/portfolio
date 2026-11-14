import { SITE_URL } from '@/lib/site';
import { allSlugs } from '@/lib/routes';

// Every real URL of the desktop (apps, folders and case studies), read from the same data the app uses.
export default function sitemap() {
  return allSlugs().map((slug) => ({
    url: `${SITE_URL}/${slug.join('/')}`.replace(/\/$/, ''),
    changeFrequency: 'monthly',
    priority: slug.length === 0 ? 1 : slug.length === 1 ? 0.8 : 0.6,
  }));
}
