import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude sharp from bundling — native binary loaded at runtime via dynamic import
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
