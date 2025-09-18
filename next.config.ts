import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://placeholder.pics/svg/640x480/DEDEDE/555555-f4f5e4/**"),
      new URL("https://d32xnewsgayu64.cloudfront.net/**"),
      new URL("https://d2uormq82zl5xd.cloudfront.net/**"),
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
