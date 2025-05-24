import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
  // Add more PWA options if needed
});
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
img-src 'self' blob: data: https://umvtbsrjbvivfkcmvtxk.supabase.co https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org;
  font-src 'self';
  connect-src 'self' https://umvtbsrjbvivfkcmvtxk.supabase.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, "");

export default {
  ...nextConfig, // Spread the PWA config
  images: {
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
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "geolocation=(), camera=(), microphone=(), fullscreen=(self)", // restrict as needed
          },
        ],
      },
    ];
  },
};
