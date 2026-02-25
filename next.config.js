/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'developers.google.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  async rewrites() {
    return []
  },
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://developers.google.com https://*.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.vercel.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ]
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          ...securityHeaders,
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          ...securityHeaders,
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