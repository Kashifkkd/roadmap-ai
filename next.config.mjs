/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["d1mauojdrnebgs.cloudfront.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "1st90-stage-kuiper-lambda-s3.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
    ],
  },
  turbopack: {},
};

export default nextConfig;
