/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const nextConfig = {
  images: {
    domains: ["localhost", "api.awajimaaschool.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
