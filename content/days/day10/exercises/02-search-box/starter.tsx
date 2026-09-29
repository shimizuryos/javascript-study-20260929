'use client';

import { useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // TODO: 今の URL の q を初期値にする
  const [text, setText] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: 他のクエリを残したまま q だけを変える / 空なら q を消す / page は消す / 履歴を増やさない
    router.push(`${pathname}?q=${text}`);
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <input aria-label="検索語" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">検索</button>
    </form>
  );
}
