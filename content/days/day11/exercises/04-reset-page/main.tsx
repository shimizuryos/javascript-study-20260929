'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

const searchParsers = {
  q: parseAsString,
  page: parseAsInteger.withDefault(1),
};

export function useSearch() {
  const [{ q, page }, setParams] = useQueryStates(searchParsers);

  // 条件が変わったら page を消して 1 ページ目に戻す
  const setSearch = (text: string) => setParams({ q: text || null, page: null });
  const nextPage = () => setParams((old) => ({ page: old.page + 1 }));

  return { q, page, setSearch, nextPage };
}

export function SearchPanel() {
  const { q, page, setSearch, nextPage } = useSearch();
  return (
    <div>
      <label>
        検索
        <input value={q ?? ''} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <p>{page} ページ目</p>
      <button onClick={() => nextPage()}>次へ</button>
    </div>
  );
}
