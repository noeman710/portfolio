import fs from 'node:fs';
import path from 'node:path';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import LegacyApp from '@/components/LegacyApp';
import PlainView from '@/components/PlainView';
import './globals.css';

export const metadata = {
  title: 'ICON: Noemane El Afia, UX/UI Designer',
  description: 'Noemane El Afia (ICON), UX/UI Designer based in Tangier, Morocco. A portfolio built as a working desktop.',
  icons: { icon: '/assets/favicon.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

// The desktop's markup lives in content/*.html and is rendered on the server, so search
// engines (and visitors without JavaScript) get the full text. The interactive layer is
// attached on the client by components/LegacyApp.jsx.
const read = (file) => fs.readFileSync(path.join(process.cwd(), 'content', file), 'utf8').replace(/<!--[\s\S]*?-->/g, '');

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="js" suppressHydrationWarning>
      <head>
        {/* the plain-text fallback is hidden straight away; visitors without JavaScript get it back */}
        <style dangerouslySetInnerHTML={{ __html: 'html.js #plain-view{display:none}' }} />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      </head>
      <body>
        <PlainView />
        <div style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: read('desktop.html') }} />
        <LegacyApp />
        {children}
        {/* Only on Vercel: these load /_vercel/* scripts that don't exist locally */}
        {process.env.VERCEL ? <><Analytics /><SpeedInsights /></> : null}
      </body>
    </html>
  );
}
