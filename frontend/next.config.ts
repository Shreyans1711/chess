import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the "N" route indicator in dev. Errors are still shown.
  devIndicators: false,
};

export default nextConfig;
