import { createContext, useContext, type ReactNode } from 'react';

export type User = { name: string; role: 'admin' | 'member' };

const UserContext = createContext<User | null>(null);

export function UserProvider({ user, children }: { user: User; children: ReactNode }) {
  return <UserContext value={user}>{children}</UserContext>;
}

export function useUser(): User {
  const user = useContext(UserContext);
  if (user === null) {
    throw new Error('useUser は <UserProvider> の中で使ってください');
  }
  return user;
}

export function Greeting() {
  const { name } = useUser();
  return <p>こんにちは、{name}さん</p>;
}

export function AdminBadge() {
  const { role } = useUser();
  return role === 'admin' ? <span>管理者</span> : null;
}
