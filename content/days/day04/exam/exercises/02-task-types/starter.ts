// TODO: 要素がリテラル型のまま固定されるようにする
export const STATUSES = ['todo', 'doing', 'done'];
// TODO: STATUSES から作る
export type Status = string;

export type Task = { id: number; title: string; status: Status; assignee: string | null };

// TODO: ユーティリティ型で作る
export type TaskPreview = unknown;
export type NewTask = unknown;
export type TasksByStatus = unknown;

export function groupByStatus(tasks: Task[]): TasksByStatus {
  // TODO: { todo: [...], doing: [...], done: [...] } を返す
  return {};
}
