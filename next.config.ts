import type { NextConfig } from "next";

// Serve the app under a sub-path, e.g. https://shrutimandaokar.com/emberai.
// Next automatically prefixes <Link>, next/image, and the /_next/* assets with
// this. Manual fetch() calls are NOT auto-prefixed — see src/lib/apiClient.ts,
// which reads the value we expose below.
//
// Override at build time:
//   NEXT_PUBLIC_BASE_PATH=""          -> serve at the domain root
//   NEXT_PUBLIC_BASE_PATH="/foo"      -> serve under /foo
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/emberai";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  env: {
    // Expose the resolved base path to client-side code.
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
