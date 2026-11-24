/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    // Modern formats first; next/image falls back automatically.
    formats: ["image/avif", "image/webp"],
    // Cap generated widths at 1920 (the default goes up to 3840).
    deviceSizes: [640, 750, 828, 1080, 1280, 1600, 1920],
    imageSizes: [96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // three.js ships modern ESM; let Next transpile it for older browsers.
  transpilePackages: ["three"],
};

export default nextConfig;
