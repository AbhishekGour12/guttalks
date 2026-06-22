/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "unsplash.com",
      "plus.unsplash.com",
      "randomuser.me",
      "media.istockphoto.com",
      "localhost",
      "api.guttalks.in",
      "guttalks.in"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.guttalks.in",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "guttalks.in",
        pathname: "/uploads/**",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;