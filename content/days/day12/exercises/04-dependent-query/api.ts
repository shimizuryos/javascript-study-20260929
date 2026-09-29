export type User = { id: number; email: string; name: string };
export type Project = { id: number; ownerId: number; title: string };

const USERS: User[] = [
  { id: 1, email: 'sato@example.com', name: '佐藤' },
  { id: 2, email: 'suzuki@example.com', name: '鈴木' },
];

const PROJECTS: Project[] = [
  { id: 10, ownerId: 1, title: '社内ポータル' },
  { id: 11, ownerId: 1, title: '採用サイト' },
  { id: 12, ownerId: 2, title: '在庫管理' },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** fetchProjects に渡された引数の記録 (テストで使う) */
export const projectCalls: unknown[] = [];

/** 疑似 API: メールアドレスでユーザーを探す */
export async function fetchUserByEmail(email: string): Promise<User> {
  await wait(20);
  const user = USERS.find((u) => u.email === email);
  if (!user) throw new Error('ユーザーが見つかりません');
  return user;
}

/** 疑似 API: ユーザーのプロジェクトを返す */
export async function fetchProjects(ownerId: number): Promise<Project[]> {
  projectCalls.push(ownerId);
  await wait(10);
  if (typeof ownerId !== 'number') throw new Error(`ownerId が不正です: ${String(ownerId)}`);
  return PROJECTS.filter((p) => p.ownerId === ownerId);
}
