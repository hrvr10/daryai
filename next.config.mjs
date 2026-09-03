/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product images are served from /public, no remote optimization needed.
    unoptimized: true,
  },
};

export default nextConfig;
