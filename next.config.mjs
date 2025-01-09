/** @type {import('next').NextConfig} */
const nextConfig = {
    
    images: {
        // Combine `remotePatterns` and `domains`
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'images.pexels.com',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'img.clerk.com',
            pathname: '/**',
          },    
        ],
    },
};

export default nextConfig;
