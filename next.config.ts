import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2uormq82zl5xd.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
