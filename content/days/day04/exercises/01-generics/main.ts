export type Paginated<T> = { items: T[]; total: number };

export function first<T>(xs: T[]): T | undefined {
  return xs[0];
}

export function paginate<T>(all: T[], page: number, pageSize: number): Paginated<T> {
  const start = (page - 1) * pageSize;
  return { items: all.slice(start, start + pageSize), total: all.length };
}

export function mapItems<T, U>(page: Paginated<T>, fn: (item: T) => U): Paginated<U> {
  return { ...page, items: page.items.map(fn) };
}
