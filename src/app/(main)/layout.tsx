import Link from 'next/link';
import { Providers } from '@/components/providers';
import { NavLink } from '@/components/nav-link';
import { ReviewBadge } from '@/components/review-badge';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-sm text-white">
              読
            </span>
            <span>読めるNext.js</span>
          </Link>
          <nav aria-label="メイン" className="flex flex-wrap items-center gap-1">
            <NavLink href="/">ホーム</NavLink>
            <NavLink href="/exercises/">演習一覧</NavLink>
            <NavLink href="/review/">
              復習
              <ReviewBadge />
            </NavLink>
            <NavLink href="/guide/">使い方</NavLink>
            <NavLink href="/settings/">設定</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pt-4 pb-10 text-xs text-ink-3">
        進捗はこのブラウザ (localStorage) に保存されます。端末を変えるときは「設定」からエクスポートしてください。
      </footer>
    </Providers>
  );
}
