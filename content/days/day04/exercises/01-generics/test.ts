import { first, mapItems, paginate, type Paginated } from './main';

type User = { id: number; name: string };
const users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
  { id: 4, name: 'Dave' },
  { id: 5, name: 'Eve' },
];

const f1 = first([1, 2, 3]);
const f2 = first(users);
const p = paginate(users, 2, 2);
const m = mapItems(p, (u) => u.name);

type cases = [
  Expect<Equal<typeof f1, number | undefined>>,
  Expect<Equal<typeof f2, User | undefined>>,
  Expect<Equal<typeof p, Paginated<User>>>,
  Expect<Equal<typeof m, Paginated<string>>>,
];

test('first: 最初の要素を返す (空なら undefined)', () => {
  expect(f1).toBe(1);
  expect(f2).toEqual({ id: 1, name: 'Alice' });
  expect(first([])).toBeUndefined();
});

test('paginate: 2 ページ目 (1 始まり) を 2 件ずつ切り出す', () => {
  expect(p).toEqual({ items: [users[2], users[3]], total: 5 });
});

test('paginate: 最後のページは残りの件数だけ。元の配列は変更しない', () => {
  expect(paginate(users, 3, 2)).toEqual({ items: [users[4]], total: 5 });
  expect(paginate(users, 1, 10).items).toHaveLength(5);
  expect(users).toHaveLength(5);
});

test('mapItems: items だけを変換し、total はそのまま', () => {
  expect(m).toEqual({ items: ['Carol', 'Dave'], total: 5 });
  expect(p.items).toEqual([users[2], users[3]]);
});
