/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Для GitHub Pages
  output: 'export',
  basePath: '',
  trailingSlash: true,
  
  images: {
    unoptimized: true, // Необходимо для статического экспорта
  },

  // Оптимизация
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
