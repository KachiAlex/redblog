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
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "playwright-core",
        "@sparticuz/chromium",
        "chromium-bidi/lib/cjs/bidiMapper/BidiMapper",
        "chromium-bidi/lib/cjs/cdp/CdpConnection",
        "kerberos",
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
