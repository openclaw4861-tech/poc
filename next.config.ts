import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  basePath: "",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: [
    "@thatopen/components",
    "@thatopen/components-front",
    "@thatopen/fragments",
    "camera-controls",
    "three",
  ],
  serverExternalPackages: ["pdf-parse"],
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "three/webgpu": path.resolve(
        process.cwd(),
        "node_modules/three/build/three.webgpu.js",
      ),
      "three/tsl": path.resolve(
        process.cwd(),
        "node_modules/three/build/three.tsl.js",
      ),
    };

    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      fs: false,
      path: false,
      crypto: false,
      module: false,
      os: false,
    };

    if (!isServer) {
      config.externals = config.externals ?? [];
      if (Array.isArray(config.externals)) {
        config.externals.push("pdf-parse");
      }
    }

    return config;
  },
};

export default nextConfig;
