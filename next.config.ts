import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma uses Node APIs; keep the client external to the bundler.
  serverExternalPackages: ["@prisma/client"],
  allowedDevOrigins: ['dawson-tolerable-everette.ngrok-free.dev'],
};



export default nextConfig;

