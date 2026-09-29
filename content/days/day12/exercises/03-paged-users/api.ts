export type User = { id: number; name: string };
export type UsersPage = { items: User[]; hasMore: boolean };

export const PAGE_SIZE = 3;
const ALL: User[] = Array.from({ length: 7 }, (_, i) => ({ id: i + 1, name: `ユーザー${i + 1}` }));

/** fetchUsersPage が呼ばれた記録 (テストで使う) */
export const requests: { page: number; signal?: AbortSignal }[] = [];

/** 疑似 API: 少し待ってから、page ページ目 (1 始まり) のユーザーを返す */
export async function fetchUsersPage(page: number, signal?: AbortSignal): Promise<UsersPage> {
  requests.push({ page, signal });
  await new Promise((resolve) => setTimeout(resolve, 30));
  const start = (page - 1) * PAGE_SIZE;
  return { items: ALL.slice(start, start + PAGE_SIZE), hasMore: start + PAGE_SIZE < ALL.length };
}
