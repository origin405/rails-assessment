/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
  },
  transpilePackages: ["@trpc/server", "@trpc/client", "@tanstack/react-query"],
};

export default nextConfig;
