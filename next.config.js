/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "scontent-*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
