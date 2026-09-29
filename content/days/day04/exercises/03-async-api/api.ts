/** 疑似 API。本物の fetch の代わりに、少し待ってからデータを返す */
export type User = { id: number; name: string; teamId: number };
export type Team = { id: number; name: string };

const USERS: User[] = [
  { id: 1, name: 'Alice', teamId: 10 },
  { id: 2, name: 'Bob', teamId: 20 },
  { id: 3, name: 'Carol', teamId: 10 },
];

const TEAMS: Team[] = [
  { id: 10, name: '開発' },
  { id: 20, name: '営業' },
];

/** テスト用の記録。inFlight は「今、通信中の数」、maxInFlight はその最大値 */
export const stats = { calls: 0, inFlight: 0, maxInFlight: 0 };

export function resetStats() {
  stats.calls = 0;
  stats.inFlight = 0;
  stats.maxInFlight = 0;
}

async function request<T>(find: () => T | undefined, notFoundMessage: string): Promise<T> {
  stats.calls += 1;
  stats.inFlight += 1;
  stats.maxInFlight = Math.max(stats.maxInFlight, stats.inFlight);
  try {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const found = find();
    if (found === undefined) throw new Error(notFoundMessage);
    return found;
  } finally {
    stats.inFlight -= 1;
  }
}

export function fetchUser(id: number): Promise<User> {
  return request(() => USERS.find((u) => u.id === id), `ユーザー ${id} は見つかりません`);
}

export function fetchTeam(id: number): Promise<Team> {
  return request(() => TEAMS.find((t) => t.id === id), `チーム ${id} は見つかりません`);
}
