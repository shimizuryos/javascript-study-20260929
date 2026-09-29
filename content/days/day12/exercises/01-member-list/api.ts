export type Member = { id: number; name: string };

const TEAMS: Record<string, Member[]> = {
  design: [
    { id: 1, name: '佐藤' },
    { id: 2, name: '鈴木' },
  ],
  dev: [
    { id: 3, name: '高橋' },
    { id: 4, name: '田中' },
    { id: 5, name: '伊藤' },
  ],
};

/** fetchMembers が呼ばれた記録 (テストで使う) */
export const calls: string[] = [];

/** 疑似 API: 少し待ってから、チームのメンバーを返す */
export async function fetchMembers(teamId: string): Promise<Member[]> {
  calls.push(teamId);
  await new Promise((resolve) => setTimeout(resolve, 10));
  const members = TEAMS[teamId];
  if (!members) throw new Error(`チーム ${teamId} が見つかりません`);
  return members;
}
