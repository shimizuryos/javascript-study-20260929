'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const n = Number(searchParams.get('page'));
  const page = Number.isInteger(n) && n >= 1 ? n : 1;

  /** 今のクエリをコピーして page だけを変えた URL */
  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams);
    if (target === 1) params.delete('page');
    else params.set('page', String(target));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav aria-label="ページ送り">
      {page > 1 ? <Link href={hrefFor(page - 1)}>前へ</Link> : <span>前へ</span>}
      <span>
        {page} / {totalPages}
      </span>
      {page < totalPages ? <Link href={hrefFor(page + 1)}>次へ</Link> : <span>次へ</span>}
    </nav>
  );
}
