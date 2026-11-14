import { notFound } from 'next/navigation';
import { OG_IMAGE } from '@/lib/site';
import { APP_TITLES, allSlugs, isValidSlug } from '@/lib/routes';

// The whole desktop is rendered once by the root layout and keeps running across
// /work, /about, /work/<folder>/<case> ... (the app updates the URL itself with the History API).
// This page only exists so every valid URL resolves; anything else shows app/not-found.jsx (404).
export const dynamicParams = true;

export function generateStaticParams() {
  return [...allSlugs(), ['trash']].map((slug) => ({ slug }));
}

const prettify = (id) => id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Each URL gets its own title and canonical link (good for search results and shared links).
export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  if (!slug.length || !isValidSlug(slug)) return {};
  const title = slug.length === 1 ? APP_TITLES[slug[0]] : prettify(slug[slug.length - 1]);
  const url = `/${slug.join('/')}`;
  return {
    title,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'ICON', title: `${title} | ICON`, url, images: [OG_IMAGE] },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  return null;
}
