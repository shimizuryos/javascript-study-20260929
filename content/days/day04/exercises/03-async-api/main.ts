import { fetchTeam, fetchUser } from './api';

export async function getUserName(id: number): Promise<string> {
  try {
    const user = await fetchUser(id);
    return user.name;
  } catch {
    return '(不明なユーザー)';
  }
}

export async function getUserWithTeam(id: number): Promise<{ name: string; team: string }> {
  const user = await fetchUser(id);
  const team = await fetchTeam(user.teamId); // user.teamId が必要なので、順番に待つしかない
  return { name: user.name, team: team.name };
}

export async function getUserNames(ids: number[]): Promise<string[]> {
  const users = await Promise.all(ids.map((id) => fetchUser(id)));
  return users.map((user) => user.name);
}
