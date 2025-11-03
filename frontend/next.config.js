/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // For Vercel deployment: Use environment variable for API URL
  // In development: can proxy to localhost:3000 via rewrites if needed
  // In production: NEXT_PUBLIC_API_URL should be set to backend URL
  async rewrites() {
    // Only proxy in development if backend is local
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*',
        },
      ];
    }
    return [];
  },
}

module.exports = nextConfig

