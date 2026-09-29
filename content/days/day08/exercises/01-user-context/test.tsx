import type { ReactNode } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { AdminBadge, Greeting, UserProvider, useUser } from './main';

function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header>
        <nav>{children}</nav>
      </header>
    </div>
  );
}

test('UserProvider の中なら、深い場所のコンポーネントでもユーザーを読める', () => {
  render(
    <UserProvider user={{ name: 'Alice', role: 'admin' }}>
      <Layout>
        <Greeting />
        <AdminBadge />
      </Layout>
    </UserProvider>,
  );
  expect(screen.getByText('こんにちは、Aliceさん')).toBeInTheDocument();
  expect(screen.getByText('管理者')).toBeInTheDocument();
});

test('role が member なら AdminBadge は何も表示しない', () => {
  render(
    <UserProvider user={{ name: 'Bob', role: 'member' }}>
      <Greeting />
      <AdminBadge />
    </UserProvider>,
  );
  expect(screen.getByText('こんにちは、Bobさん')).toBeInTheDocument();
  expect(screen.queryByText('管理者')).toBeNull();
});

test('renderHook の wrapper に Provider を渡すと、useUser が user を返す', () => {
  const user = { name: 'Carol', role: 'member' } as const;
  const { result } = renderHook(() => useUser(), {
    wrapper: ({ children }) => <UserProvider user={user}>{children}</UserProvider>,
  });
  expect(result.current).toBe(user);
});

test('内側の Provider の値が優先される', () => {
  render(
    <UserProvider user={{ name: 'Alice', role: 'admin' }}>
      <Greeting />
      <UserProvider user={{ name: 'Bob', role: 'member' }}>
        <Greeting />
      </UserProvider>
    </UserProvider>,
  );
  expect(screen.getAllByText(/^こんにちは/).map((p) => p.textContent)).toEqual([
    'こんにちは、Aliceさん',
    'こんにちは、Bobさん',
  ]);
});

test("Provider の外で useUser を使うと、'UserProvider' を含むエラーを投げる", () => {
  expect(() => renderHook(() => useUser())).toThrow('UserProvider');
});
