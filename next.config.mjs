/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "umvtbsrjbvivfkcmvtxk.supabase.co",
      },
    ],
  },
};

export default nextConfig;
