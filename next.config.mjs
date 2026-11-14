/** @type {import('next').NextConfig} */
const longCache = (maxAge, extra = '') => [{ key: 'Cache-Control', value: `public, max-age=${maxAge}${extra}` }];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Version tag for /js/*.js (added in components/LegacyApp.jsx) so browsers never keep an old copy after a deploy.
  env: { NEXT_PUBLIC_BUILD: process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now()) },
  async headers() {
    return [
      // versioned with ?v=<commit>, so they can be cached for a year
      { source: '/js/:path*', headers: longCache(31536000, ', immutable') },
      // same file names can be replaced between deploys: cache a week, refresh quietly in the background
      { source: '/assets/:path*', headers: longCache(604800, ', stale-while-revalidate=86400') },
      { source: '/icons/:path*', headers: longCache(604800, ', stale-while-revalidate=86400') },
    ];
  },
};
export default nextConfig;
