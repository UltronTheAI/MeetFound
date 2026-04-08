import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  allowedDevOrigins: ["192.168.1.2"],
};

export default nextConfig;
