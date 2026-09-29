/** 疑似 API。本物の fetch の代わりに、少し待ってからデータを返す */
export type Task = { id: number; title: string; assignee: string | null };

const TASKS: Task[] = [
  { id: 1, title: '設計レビュー', assignee: 'Alice' },
  { id: 2, title: 'テスト追加', assignee: null },
  { id: 3, title: 'リリース', assignee: 'Bob' },
];

/** テスト用の記録。calls は呼ばれた id、inFlight は「今、通信中の数」 */
export const stats = { calls: [] as number[], inFlight: 0, maxInFlight: 0 };

export function resetStats() {
  stats.calls = [];
  stats.inFlight = 0;
  stats.maxInFlight = 0;
}

export async function fetchTask(id: number): Promise<Task> {
  stats.calls.push(id);
  stats.inFlight += 1;
  stats.maxInFlight = Math.max(stats.maxInFlight, stats.inFlight);
  try {
    await new Promise((resolve) => setTimeout(resolve, 10));
    // 古いコードにありがちな、Error ではない値で失敗するパターン
    if (id < 0) throw 'ID が不正です';
    const task = TASKS.find((t) => t.id === id);
    if (!task) throw new Error(`タスク ${id} は見つかりません`);
    return task;
  } finally {
    stats.inFlight -= 1;
  }
}
