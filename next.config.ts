const isExtensionBuild = process.env.EXTENSION_BUILD === 'true';

const nextConfig = {
  output: isExtensionBuild ? 'export' : undefined,
  trailingSlash: isExtensionBuild,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
