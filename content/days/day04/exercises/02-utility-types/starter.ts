export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
};

export async function fetchUser(id: number): Promise<User> {
  return { id, name: 'Alice', email: 'alice@example.com', role: 'admin', createdAt: '2026-04-01' };
}

// TODO: unknown を、User や fetchUser から作った型に書き換える
export type UserSummary = unknown; // Pick
export type NewUser = unknown; // Omit
export type UserPatch = unknown; // Partial
export type Role = unknown; // User['...']
export type RoleLabels = unknown; // Record
export type FetchedUser = unknown; // Awaited + ReturnType
export type FetchUserArgs = unknown; // Parameters

export const ROLE_LABELS: RoleLabels = { admin: '管理者', member: 'メンバー' };

export function applyPatch(user: User, patch: UserPatch): User {
  // TODO: user に patch を上書きした新しいオブジェクトを返す
  return user;
}

export function toSummary(user: User): UserSummary {
  // TODO: id と name だけのオブジェクトを返す
  return user;
}
