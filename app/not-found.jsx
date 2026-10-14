export const metadata = {
  title: '404 · Page not found',
  robots: { index: false },
};

// Rendered inside the root layout, so the animated liquid background is already running behind it.
// app/styles/not-found.css hides the desktop UI (menu bar, icons, dock...) while this page is shown.
export default function NotFound() {
  return (
    <main className="nf-page">
      <p className="nf-code" aria-hidden="true">404</p>
      <h1 className="nf-title">Page not found</h1>
      <p className="nf-text">The page you are looking for doesn’t exist, or it has moved somewhere else.</p>
      {/* a normal link on purpose: a full load restarts the desktop cleanly */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="nf-btn" href="/">Back to the desktop</a>
    </main>
  );
}
