/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    esmExternals: false,
  },
  transpilePackages: ["@trpc/server", "@trpc/client", "@tanstack/react-query"],
};

export default nextConfig;
