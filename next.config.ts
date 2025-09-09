import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress hydration warnings in development
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: false,
  }),
};

export default nextConfig;
