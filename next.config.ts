import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: there is no server, the whole app is HTML and JS on a CDN.
  output: "export",
};

export default nextConfig;
