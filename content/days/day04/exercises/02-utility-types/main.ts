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

export type UserSummary = Pick<User, 'id' | 'name'>;
export type NewUser = Omit<User, 'id' | 'createdAt'>;
export type UserPatch = Partial<NewUser>;
export type Role = User['role'];
export type RoleLabels = Record<Role, string>;
export type FetchedUser = Awaited<ReturnType<typeof fetchUser>>;
export type FetchUserArgs = Parameters<typeof fetchUser>;

export const ROLE_LABELS: RoleLabels = { admin: '管理者', member: 'メンバー' };

export function applyPatch(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}

export function toSummary({ id, name }: User): UserSummary {
  return { id, name };
}
