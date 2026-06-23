import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      new URL("https://placeholder.pics/svg/640x480/DEDEDE/555555-f4f5e4/**"),
      new URL("https://d32xnewsgayu64.cloudfront.net/**"),
      new URL("https://d2uormq82zl5xd.cloudfront.net/**"),
    ],
  },
};

export default nextConfig;
