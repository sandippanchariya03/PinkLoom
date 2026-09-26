import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/workspace",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
