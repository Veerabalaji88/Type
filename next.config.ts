import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 Tell Next.js to NOT bundle these messy PDF libraries for the browser
  serverExternalPackages: ["pdf-parse-fork", "pdfkit", "fontkit"], 
};

export default nextConfig;