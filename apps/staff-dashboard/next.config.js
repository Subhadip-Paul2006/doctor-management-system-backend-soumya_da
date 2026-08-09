/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@doctor/api-client",
    "@doctor/types",
    "@doctor/ui",
    "@doctor/utils",
  ],
};

module.exports = nextConfig;
