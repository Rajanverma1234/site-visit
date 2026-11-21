/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // three.js ships modern ESM; let Next transpile it for older browsers.
  transpilePackages: ["three"],
};

export default nextConfig;
