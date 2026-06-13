import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
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
