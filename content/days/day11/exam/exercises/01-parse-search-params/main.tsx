export type SearchParams = { [key: string]: string | string[] | undefined };
export type ListParams = { page: number; q: string; sort: 'new' | 'old' };

/** ?q=a&q=b のように配列で来たら最初の値を使う */
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseListParams(searchParams: SearchParams): ListParams {
  const page = Number(first(searchParams.page));
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    q: first(searchParams.q) ?? '',
    sort: first(searchParams.sort) === 'old' ? 'old' : 'new',
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { page, q, sort } = parseListParams(await searchParams);
  return (
    <p>
      page={page} q={q} sort={sort}
    </p>
  );
}
