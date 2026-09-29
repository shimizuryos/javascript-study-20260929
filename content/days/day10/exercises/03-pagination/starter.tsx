'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // TODO: 無い・不正な値 (abc, 0 など) のときは 1 にする
  const page = Number(searchParams.get('page') ?? '1');

  // TODO: 今のクエリ (q や tags) を残したまま page だけを変える。1 ページ目なら page を消す
  const hrefFor = (target: number) => `${pathname}?page=${target}`;

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
