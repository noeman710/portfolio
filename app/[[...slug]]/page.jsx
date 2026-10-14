// The whole desktop is rendered once by the root layout and keeps running across
// /work, /about, /work/<case> ... (the app updates the URL itself with the History API).
// This page only exists so every one of those URLs resolves instead of 404ing.
const APPS = ['work', 'about', 'photos', 'notes', 'mail', 'maps'];

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ slug: [] }, ...APPS.map((a) => ({ slug: [a] })), { slug: ['work', 'mediassive'] }];
}

export default function Page() {
  return null;
}
