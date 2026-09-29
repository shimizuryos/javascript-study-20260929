import { resetStats, stats } from './api';
import { loadAssignees, loadTaskTitle } from './main';

beforeEach(() => {
  resetStats();
});

test('loadTaskTitle: タスクのタイトルを返す', async () => {
  expect(await loadTaskTitle(1)).toBe('設計レビュー');
});

test("loadTaskTitle: null なら API を呼ばずに '(未選択)'", async () => {
  expect(await loadTaskTitle(null)).toBe('(未選択)');
  expect(stats.calls).toEqual([]);
});

test('loadTaskTitle: Error で失敗したら、その message を使う', async () => {
  await expect(loadTaskTitle(99)).resolves.toBe('読み込み失敗: タスク 99 は見つかりません');
});

test('loadTaskTitle: Error ではない値で失敗したら、それを文字列にして使う', async () => {
  await expect(loadTaskTitle(-1)).resolves.toBe('読み込み失敗: ID が不正です');
});

test("loadAssignees: ids の順番で担当者名を返す (null は '未割り当て')", async () => {
  expect(await loadAssignees([3, 2, 1])).toEqual(['Bob', '未割り当て', 'Alice']);
});

test('loadAssignees: 並列に取得している (Promise.all)', async () => {
  await loadAssignees([1, 2, 3]);
  expect(stats.calls).toEqual([1, 2, 3]);
  expect(stats.maxInFlight).toBe(3);
});
