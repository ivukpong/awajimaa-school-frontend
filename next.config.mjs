/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "api.awajimaaschool.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
