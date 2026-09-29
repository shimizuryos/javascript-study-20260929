import { fetchTeam, fetchUser } from './api';

export async function getUserName(id: number): Promise<string> {
  // TODO: fetchUser を await して name を返す。失敗したら '(不明なユーザー)'
  return '';
}

export async function getUserWithTeam(id: number): Promise<{ name: string; team: string }> {
  // TODO: ユーザーを取得 → その teamId で fetchTeam → { name, team } を返す
  return { name: '', team: '' };
}

// TODO: 1 人ずつ順番に待っているので遅い。Promise.all で並列にする
export async function getUserNames(ids: number[]): Promise<string[]> {
  const names: string[] = [];
  for (const id of ids) {
    const user = await fetchUser(id);
    names.push(user.name);
  }
  return names;
}
