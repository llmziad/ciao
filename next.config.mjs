/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // sharp is a server-only native dep; keep it external to the server bundle
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  // Lint is run separately via `npm run lint`; don't fail the build on it.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
