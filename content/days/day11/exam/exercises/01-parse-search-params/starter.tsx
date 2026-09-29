export type SearchParams = { [key: string]: string | string[] | undefined };
export type ListParams = { page: number; q: string; sort: 'new' | 'old' };

export function parseListParams(searchParams: SearchParams): ListParams {
  // TODO: 無い値・不正な値・配列が来ても、必ず ListParams の形にする
  return {
    page: Number(searchParams.page),
    q: String(searchParams.q),
    sort: searchParams.sort as ListParams['sort'],
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // TODO: searchParams は Promise
  const { page, q, sort } = parseListParams({});
  return (
    <p>
      page={page} q={q} sort={sort}
    </p>
  );
}
