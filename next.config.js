/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
          remotePatterns: [
            {
              protocol: 'https',
              hostname: 'marketplace.canva.com',
            },
          ],
        },
}

module.exports = nextConfig
