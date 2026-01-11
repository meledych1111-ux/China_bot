/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Отключаем ESLint при сборке
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Увеличиваем лимит размера тела для webhook
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

module.exports = nextConfig;
