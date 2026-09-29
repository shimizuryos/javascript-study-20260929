import {
  STATUSES,
  groupByStatus,
  type NewTask,
  type Status,
  type Task,
  type TaskPreview,
  type TasksByStatus,
} from './main';

type cases = [
  Expect<Equal<typeof STATUSES, readonly ['todo', 'doing', 'done']>>,
  Expect<Equal<Status, 'todo' | 'doing' | 'done'>>,
  Expect<Equal<TaskPreview, { id: number; title: string }>>,
  Expect<Equal<NewTask, { title: string; status: Status; assignee: string | null }>>,
  Expect<Equal<TasksByStatus, { todo: Task[]; doing: Task[]; done: Task[] }>>,
];

// @ts-expect-error — Status に無い値は使えない
const badStatus: Status = 'closed';

// @ts-expect-error — NewTask に id は含められない
const badNew: NewTask = { id: 1, title: 'x', status: 'todo', assignee: null };

const tasks: Task[] = [
  { id: 1, title: '設計', status: 'done', assignee: 'Alice' },
  { id: 2, title: '実装', status: 'doing', assignee: null },
  { id: 3, title: 'テスト', status: 'doing', assignee: 'Bob' },
];

test('groupByStatus: 状態ごとに分ける (元の順番のまま)', () => {
  const grouped = groupByStatus(tasks);
  expect(grouped.done.map((t) => t.id)).toEqual([1]);
  expect(grouped.doing.map((t) => t.id)).toEqual([2, 3]);
});

test('groupByStatus: 該当するタスクが無い状態も空配列で含める', () => {
  expect(groupByStatus(tasks).todo).toEqual([]);
  expect(groupByStatus([])).toEqual({ todo: [], doing: [], done: [] });
});

test('STATUSES の実行時の値', () => {
  expect(STATUSES).toEqual(['todo', 'doing', 'done']);
  expect([badStatus, badNew.title]).toEqual(['closed', 'x']);
});
