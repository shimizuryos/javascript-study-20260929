export type User = { id: number; name: string; team: string; active: boolean; age: number };

export const activeNames = (users: User[]) => users.filter((u) => u.active).map((u) => u.name);

export const nameOf = (users: User[], id: number) => users.find((u) => u.id === id)?.name ?? '(不明)';

export const inTeams = (users: User[], teams: string[]) => users.filter((u) => teams.includes(u.team));

export const summarize = (users: User[]) => ({
  count: users.length,
  hasMinor: users.some((u) => u.age < 18),
  allActive: users.every((u) => u.active),
});
