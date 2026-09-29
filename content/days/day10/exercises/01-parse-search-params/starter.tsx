export type SearchParams = { [key: string]: string | string[] | undefined };
export type ProductQuery = { page: number; q: string | null; tags: string[] };

export function parseSearchParams(sp: SearchParams): ProductQuery {
  // TODO: string | string[] | undefined を、それぞれ安全に変換する
  return {
    page: Number(sp.page),
    q: sp.q as string,
    tags: [],
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // TODO: searchParams は Promise。await してから parseSearchParams に渡す
  const { page, q, tags } = parseSearchParams({});

  return (
    <section>
      <h1>商品一覧</h1>
      <p>{page} ページ目</p>
      <p>検索語: {q ?? 'なし'}</p>
      <p>タグ: {tags.length > 0 ? tags.join(', ') : 'なし'}</p>
    </section>
  );
}
