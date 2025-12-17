import type {NextConfig} from 'next';

const isExtensionBuild = process.env.EXTENSION_BUILD === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  output: isExtensionBuild ? 'export' : undefined,
  trailingSlash: isExtensionBuild,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
