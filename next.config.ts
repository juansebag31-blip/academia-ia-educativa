import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return [];

    const rewrites = [
      {
        source: "/course-assets-optimized/:path*",
        destination: `${supabaseUrl}/storage/v1/object/public/course-assets/v2/:path*`,
      },
    ];

    if (process.env.NODE_ENV === "production") {
      rewrites.push({
        source: "/course-assets/:path*",
        destination: `${supabaseUrl}/storage/v1/object/public/course-assets/v1/:path*`,
      });
    }

    return rewrites;
  },
  async headers() {
    return [
      {
        source: "/course-assets-optimized/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
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
