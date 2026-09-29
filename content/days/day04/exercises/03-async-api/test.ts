import { resetStats, stats } from './api';
import { getUserName, getUserNames, getUserWithTeam } from './main';

beforeEach(() => {
  resetStats();
});

test('getUserName: ユーザー名を返す', async () => {
  expect(await getUserName(2)).toBe('Bob');
});

test("getUserName: 見つからないときは失敗させずに '(不明なユーザー)'", async () => {
  await expect(getUserName(99)).resolves.toBe('(不明なユーザー)');
});

test('getUserWithTeam: ユーザー名と所属チーム名を返す', async () => {
  expect(await getUserWithTeam(3)).toEqual({ name: 'Carol', team: '開発' });
  expect(await getUserWithTeam(2)).toEqual({ name: 'Bob', team: '営業' });
});

test('getUserWithTeam: ユーザーが見つからなければ失敗 (reject) する', async () => {
  await expect(getUserWithTeam(99)).rejects.toHaveProperty('message', 'ユーザー 99 は見つかりません');
});

test('getUserNames: ids と同じ順番で名前を返す', async () => {
  expect(await getUserNames([3, 1, 2])).toEqual(['Carol', 'Alice', 'Bob']);
});

test('getUserNames: 全員分を同時に取得している (Promise.all)', async () => {
  await getUserNames([1, 2, 3]);
  expect(stats.calls).toBe(3);
  expect(stats.maxInFlight).toBe(3);
});
