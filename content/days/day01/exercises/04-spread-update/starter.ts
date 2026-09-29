export type Query = { page: number; q: string; sort: 'new' | 'old' };

export function nextQuery(query: Query, patch: Partial<Query>): Query {
  // TODO: スプレッド構文で新しいオブジェクトを作る
  Object.assign(query, patch); // ← 元のオブジェクトを書き換えてしまっている
  return query;
}

export function addTag(tags: string[], tag: string): string[] {
  // TODO: 元の配列を変更しない
  tags.push(tag);
  return tags;
}
