import { activeNames, inTeams, nameOf, summarize, type User } from './main';

const users: User[] = [
  { id: 1, name: 'Alice', team: 'dev', active: true, age: 31 },
  { id: 2, name: 'Bob', team: 'sales', active: false, age: 17 },
  { id: 3, name: 'Carol', team: 'dev', active: true, age: 24 },
  { id: 4, name: 'Dave', team: 'design', active: true, age: 45 },
];

test('activeNames: active な人の名前だけを返す', () => {
  expect(activeNames(users)).toEqual(['Alice', 'Carol', 'Dave']);
});

test('nameOf: id から名前を探す', () => {
  expect(nameOf(users, 3)).toBe('Carol');
});

test("nameOf: 見つからなければ '(不明)'", () => {
  expect(nameOf(users, 9)).toBe('(不明)');
  expect(nameOf([], 1)).toBe('(不明)');
});

test('inTeams: 指定したチームの人だけを元の順番で返す', () => {
  expect(inTeams(users, ['dev', 'design']).map((u) => u.name)).toEqual(['Alice', 'Carol', 'Dave']);
  expect(inTeams(users, [])).toEqual([]);
});

test('summarize: 人数・未成年がいるか・全員 active か', () => {
  expect(summarize(users)).toEqual({ count: 4, hasMinor: true, allActive: false });
  expect(summarize(users.filter((u) => u.active))).toEqual({ count: 3, hasMinor: false, allActive: true });
});

test('summarize: 空配列では allActive が true になる (every の性質)', () => {
  expect(summarize([])).toEqual({ count: 0, hasMinor: false, allActive: true });
});
