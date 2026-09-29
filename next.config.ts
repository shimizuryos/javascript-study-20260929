import type { NextConfig } from 'next';

// GitHub Pages ではリポジトリ名がパスの先頭に付く (例: /javascript-study-20260929)。
// デプロイ時に PAGES_BASE_PATH を渡し、ローカルでは空文字にする。
const basePath = process.env.PAGES_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
