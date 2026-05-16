import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for the app
  basePath: '',
  // reactStrictMode: true,
  
  // Configure webpack to handle pdf-parse properly (server-side only)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude pdf-parse from client bundles - it's only used in API routes
      config.externals = config.externals || [];
      config.externals.push('pdf-parse');
    }
    return config;
  },
};

export default nextConfig;
