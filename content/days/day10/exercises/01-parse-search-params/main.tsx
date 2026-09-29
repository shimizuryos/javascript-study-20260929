export type SearchParams = { [key: string]: string | string[] | undefined };
export type ProductQuery = { page: number; q: string | null; tags: string[] };

type Value = SearchParams[string];

const first = (value: Value) => (Array.isArray(value) ? value[0] : value);
const toArray = (value: Value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

export function parseSearchParams(sp: SearchParams): ProductQuery {
  const page = Number(first(sp.page));
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    q: first(sp.q) || null,
    tags: toArray(sp.tags),
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { page, q, tags } = parseSearchParams(await searchParams);

  return (
    <section>
      <h1>商品一覧</h1>
      <p>{page} ページ目</p>
      <p>検索語: {q ?? 'なし'}</p>
      <p>タグ: {tags.length > 0 ? tags.join(', ') : 'なし'}</p>
    </section>
  );
}
