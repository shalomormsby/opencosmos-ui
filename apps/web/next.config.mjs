/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@opencosmos/ui', '@opencosmos/mcp'],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'thesage.dev' }],
        destination: 'https://studio.opencosmos.ai/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
}

export default nextConfig
