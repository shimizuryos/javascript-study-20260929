import { fetchTask } from './api';

export async function loadTaskTitle(id: number | null): Promise<string> {
  if (id === null) return '(未選択)';
  try {
    const task = await fetchTask(id);
    return task.title;
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return `読み込み失敗: ${reason}`;
  }
}

export async function loadAssignees(ids: number[]): Promise<string[]> {
  const tasks = await Promise.all(ids.map((id) => fetchTask(id)));
  return tasks.map((task) => task.assignee ?? '未割り当て');
}
