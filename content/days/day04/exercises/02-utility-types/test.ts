import {
  ROLE_LABELS,
  applyPatch,
  fetchUser,
  toSummary,
  type FetchUserArgs,
  type FetchedUser,
  type NewUser,
  type Role,
  type RoleLabels,
  type User,
  type UserPatch,
  type UserSummary,
} from './main';

type cases = [
  Expect<Equal<UserSummary, { id: number; name: string }>>,
  Expect<Equal<NewUser, { name: string; email: string; role: 'admin' | 'member' }>>,
  Expect<Equal<UserPatch, { name?: string; email?: string; role?: 'admin' | 'member' }>>,
  Expect<Equal<Role, 'admin' | 'member'>>,
  Expect<Equal<RoleLabels, { admin: string; member: string }>>,
  Expect<Equal<FetchedUser, User>>,
  Expect<Equal<FetchUserArgs, [id: number]>>,
];

// @ts-expect-error — UserPatch に id は含められない
const badPatch: UserPatch = { id: 2 };

const alice: User = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin', createdAt: '2026-04-01' };

test('applyPatch: patch の内容で上書きした新しいオブジェクトを返す', () => {
  const next = applyPatch(alice, { role: 'member' });
  expect(next).toEqual({ ...alice, role: 'member' });
  expect(next).not.toBe(alice);
  expect(alice.role).toBe('admin');
});

test('applyPatch: 空の patch なら中身は同じ', () => {
  expect(applyPatch(alice, {})).toEqual(alice);
  expect(badPatch).toEqual({ id: 2 });
});

test('toSummary: id と name だけを返す', () => {
  expect(toSummary(alice)).toEqual({ id: 1, name: 'Alice' });
});

test('ROLE_LABELS と fetchUser (実行時の値)', async () => {
  expect(ROLE_LABELS.member).toBe('メンバー');
  await expect(fetchUser(7)).resolves.toMatchObject({ id: 7 });
});
