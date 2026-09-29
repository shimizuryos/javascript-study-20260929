'use client';

import { useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get('q') ?? '');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams); // 読み取り専用なのでコピーする
    const q = text.trim();
    if (q) params.set('q', q);
    else params.delete('q');
    params.delete('page'); // 条件が変わったら 1 ページ目へ
    router.replace(`${pathname}?${params}`); // 入力のたびに履歴を増やさない
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <input aria-label="検索語" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">検索</button>
    </form>
  );
}
