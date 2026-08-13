//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    svgr: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://student-erp-api.onrender.com/api/v1/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'https://student-erp-api.onrender.com/api/v1/admin/:path*',
      },
    ];
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
