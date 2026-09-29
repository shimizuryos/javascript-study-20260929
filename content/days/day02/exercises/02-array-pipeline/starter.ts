export type User = { id: number; name: string; team: string; active: boolean; age: number };

export function activeNames(users: User[]): string[] {
  // TODO: active な人だけ残して (filter)、名前に変換する (map)
  return [];
}

export function nameOf(users: User[], id: number): string {
  // TODO: find で探す。見つからなければ '(不明)'
  return '';
}

export function inTeams(users: User[], teams: string[]): User[] {
  // TODO: teams に含まれるチームの人だけ残す
  return users;
}

export function summarize(users: User[]) {
  // TODO: length / some / every を使う
  return { count: 0, hasMinor: false, allActive: false };
}
