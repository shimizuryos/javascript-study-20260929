import { createContext, useContext, type ReactNode } from 'react';

export type User = { name: string; role: 'admin' | 'member' };

const UserContext = createContext<User | null>(null);

export function UserProvider({ user, children }: { user: User; children: ReactNode }) {
  // TODO: UserContext で children を包み、user を渡す
  return <>{children}</>;
}

export function useUser(): User {
  // TODO: useContext(UserContext) で読む。null (Provider の外) ならエラーを投げる
  return { name: '???', role: 'member' };
}

export function Greeting() {
  const { name } = useUser();
  return <p>こんにちは、{name}さん</p>;
}

export function AdminBadge() {
  const { role } = useUser();
  return role === 'admin' ? <span>管理者</span> : null;
}
