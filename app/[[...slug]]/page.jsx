import { notFound } from 'next/navigation';
import { APPS, isValidSlug } from '@/lib/routes';

// The whole desktop is rendered once by the root layout and keeps running across
// /work, /about, /work/<folder>/<case> ... (the app updates the URL itself with the History API).
// This page only exists so every valid URL resolves; anything else shows app/not-found.jsx (404).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ slug: [] }, ...APPS.map((a) => ({ slug: [a] })), { slug: ['work', 'mediassive'] }];
}

export default async function Page({ params }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  return null;
}
