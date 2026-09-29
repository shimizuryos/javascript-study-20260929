'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const SORT_LABELS = { new: '新しい順', old: '古い順', price: '価格順' } as const;

export function SortSelect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // TODO: URL の sort を読む (無ければ 'new')
  const current = 'new';

  const changeSort = (next: string) => {
    // TODO: パスと他のクエリを残したまま sort を変え、page は消す
    router.push(`?sort=${next}`);
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
