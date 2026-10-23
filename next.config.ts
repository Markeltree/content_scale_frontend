import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a plain HTML/JS site into `out/` for shared hosting (Hostinger).
// Vercel builds without it and keeps the normal Next.js output.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport && {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
