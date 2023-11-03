/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_HOST: process.env.HOST,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_TYNI_MCE_API: process.env.TYNI_MCE_API,
    NEXT_PUBLIC_MAPS: process.env.MAPS_KEY,
    NEXT_PUBLIC_CAPTCHA_KEY: process.env.CAPTCHA_KEY,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
