/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'developers.google.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Force dynamic rendering for API routes
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Disable static optimization for API routes
  async rewrites() {
    return []
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  // 프로덕션 빌드에서 console.log 제거
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // 클라이언트 사이드에서만 console 제거
      config.optimization = {
        ...config.optimization,
        minimize: true,
      }
    }
    return config
  },
  // 프로덕션에서 console 제거를 위한 컴파일러 옵션
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // error와 warn은 유지
    } : false,
  },
}

module.exports = nextConfig 