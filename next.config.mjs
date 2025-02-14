import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
  // Add more PWA options if needed
});

export default {
  ...nextConfig, // Spread the PWA config
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "umvtbsrjbvivfkcmvtxk.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};
