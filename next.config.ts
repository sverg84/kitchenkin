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
  serverExternalPackages: process.env.TURBOPACK
    ? [
        "@pothos/core",
        "@pothos/plugin-relay",
        "@pothos/plugin-prisma",
        "graphql",
      ]
    : ["graphql"],
};

export default nextConfig;
