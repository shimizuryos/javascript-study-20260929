import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '読めるNext.js — 14日間トレーニング', template: '%s | 読めるNext.js' },
  description: 'JavaScript / TypeScript から React、Next.js、nuqs・TanStack Query・TanStack Table までを 14 日で「読める」ようにする学習アプリ。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const THEME_SCRIPT = `try{var t=localStorage.getItem('js-study:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // テーマはブラウザの保存値を描画前に反映する (サーバーの HTML と違ってよいので警告を抑制)
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
