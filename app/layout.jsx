import fs from 'node:fs';
import path from 'node:path';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import LegacyApp from '@/components/LegacyApp';
import Wallpaper from '@/components/Wallpaper';
import PlainView from '@/components/PlainView';
import { OG_IMAGE, SITE_URL } from '@/lib/site';
import './globals.css';

const TITLE = 'ICON: Noemane El Afia, UX/UI Designer';
const DESCRIPTION = 'Noemane El Afia (ICON), UX/UI Designer based in Tangier, Morocco. A portfolio built as a working desktop.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | ICON' },
  description: DESCRIPTION,
  applicationName: 'ICON Portfolio',
  authors: [{ name: 'Noemane El Afia' }],
  keywords: ['UX/UI designer', 'product designer', 'portfolio', 'Tangier', 'Morocco', 'Noemane El Afia', 'ICON'],
  alternates: { canonical: '/' },
  icons: { icon: '/assets/favicon.png' },
  openGraph: {
    type: 'website',
    siteName: 'ICON',
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    images: [OG_IMAGE],
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION, images: ['/assets/images/portrait.jpg'] },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#04070d',
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
      </head>
      <body>
        <PlainView />
        <div style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: read('desktop.html') }} />
        <LegacyApp />
        <Wallpaper />
        {children}
        {/* Only on Vercel: these load /_vercel/* scripts that don't exist locally */}
        {process.env.VERCEL ? <><Analytics /><SpeedInsights /></> : null}
      </body>
    </html>
  );
}
