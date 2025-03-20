/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["live.staticflickr.com"], // ✅ Allow external domain
  },
};

export default nextConfig;
