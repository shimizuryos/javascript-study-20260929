export type Paginated<T> = { items: T[]; total: number };

// TODO: <T> を使って、戻り値の型が「要素の型 | undefined」になるようにする
export function first(xs: unknown[]): unknown {
  return xs[0];
}

// TODO: <T> を使って Paginated<T> を返す。page は 1 始まり
export function paginate(all: unknown[], page: number, pageSize: number): Paginated<unknown> {
  return { items: all, total: all.length };
}

// TODO: <T, U> を使う。items の各要素を fn で変換し、total はそのまま
export function mapItems(page: Paginated<unknown>, fn: (item: unknown) => unknown): Paginated<unknown> {
  return page;
}
