import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for the app
  basePath: '',
  // Use standalone output for Docker deployments
  output: 'standalone',
  reactStrictMode: true,
};

export default nextConfig;
