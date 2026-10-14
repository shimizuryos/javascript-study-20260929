import type { NextConfig } from 'next';

// サイトをサブパス (例: GitHub Pages の /javascript-study-20260929) で配信するときだけ PAGES_BASE_PATH を渡す。
// Cloudflare Workers ではルート (/) で配信するので空のまま。
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
