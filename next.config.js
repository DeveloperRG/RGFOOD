import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["cdn-icons-png.flaticon.com", "res.cloudinary.com"],
  },
  // Ignore ESLint errors during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default config;
