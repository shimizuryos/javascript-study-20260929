export const STATUSES = ['todo', 'doing', 'done'] as const;
export type Status = (typeof STATUSES)[number];

export type Task = { id: number; title: string; status: Status; assignee: string | null };

export type TaskPreview = Pick<Task, 'id' | 'title'>;
export type NewTask = Omit<Task, 'id'>;
export type TasksByStatus = Record<Status, Task[]>;

export function groupByStatus(tasks: Task[]): TasksByStatus {
  const pick = (status: Status) => tasks.filter((task) => task.status === status);
  return { todo: pick('todo'), doing: pick('doing'), done: pick('done') };
}
