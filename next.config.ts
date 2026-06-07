import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude @react-pdf/renderer from server-side bundle (browser-only library)
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
