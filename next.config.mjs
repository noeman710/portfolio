/** @type {import('next').NextConfig} */
const nextConfig = {
  // Version tag for /js/*.js so browsers never keep an old copy after a deploy.
  env: { NEXT_PUBLIC_BUILD: process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now()) },
};
export default nextConfig;
