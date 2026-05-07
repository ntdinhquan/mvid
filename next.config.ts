import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  allowedDevOrigins: ['http://172.27.112.1:3000'],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
