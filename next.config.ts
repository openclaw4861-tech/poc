import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for DigitalOcean App Platform
  // output: 'export',
  // Base path for the app
  basePath: '',
  // Avoid conflicts with static exports
  reactStrictMode: true,
};

export default nextConfig;
