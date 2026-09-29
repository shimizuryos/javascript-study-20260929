import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl font-bold">404</p>
      <p className="mt-4 text-ink-2">ページが見つかりませんでした。</p>
      <Link href="/" className="mt-6 inline-block text-accent-strong underline">
        ホームへ戻る
      </Link>
    </main>
  );
}
