'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const SORT_LABELS = { new: '新しい順', old: '古い順', price: '価格順' } as const;

export function SortSelect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const current = searchParams.get('sort') ?? 'new';

  const changeSort = (next: string) => {
    const params = new URLSearchParams(searchParams); // 読み取り専用なのでコピーしてから変更する
    params.set('sort', next);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <label>
      並び順
      <select value={current} onChange={(e) => changeSort(e.target.value)}>
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
