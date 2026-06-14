import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (process.env.NODE_ENV !== "production" || !supabaseUrl) return [];

    return [
      {
        source: "/course-assets/:path*",
        destination: `${supabaseUrl}/storage/v1/object/public/course-assets/v1/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/help",
        destination: "/",
        permanent: false,
      },
      {
        source: "/channels",
        destination: "/",
        permanent: false,
      },
      {
        source: "/professors",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
