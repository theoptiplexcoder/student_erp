//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
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
  async redirects() {
    return [
      { source: '/admin/dashboard', destination: '/admin', permanent: true },
      {
        source: '/admin/people/students/:path*',
        destination: '/admin/students/:path*',
        permanent: true,
      },
      {
        source: '/admin/programs/:path*',
        destination: '/admin/academics/programs/:path*',
        permanent: true,
      },
      {
        source: '/admin/batches/:path*',
        destination: '/admin/academics/batches/:path*',
        permanent: true,
      },
      {
        source: '/admin/sections/:path*',
        destination: '/admin/academics/sections/:path*',
        permanent: true,
      },
      {
        source: '/admin/departments/:path*',
        destination: '/admin/academics/departments/:path*',
        permanent: true,
      },
      {
        source: '/admin/institution/:path*',
        destination: '/admin/administration/institution/:path*',
        permanent: true,
      },
      {
        source: '/admin/roles/:path*',
        destination: '/admin/administration/roles/:path*',
        permanent: true,
      },
      {
        source: '/admin/permissions/:path*',
        destination: '/admin/administration/permissions/:path*',
        permanent: true,
      },
      {
        source: '/admin/settings/:path*',
        destination: '/admin/administration/settings/:path*',
        permanent: true,
      },
      {
        source: '/admin/announcements/:path*',
        destination: '/admin/communication/announcements/:path*',
        permanent: true,
      },
    ];
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
