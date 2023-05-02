/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://frogs.fi/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
