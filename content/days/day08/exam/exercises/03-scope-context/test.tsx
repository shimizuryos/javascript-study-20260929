import { render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScopeLabel, ScopeProvider, ScopeSwitcher, useScope } from './main';

test("initialScope を省略すると 'all' (表示中: すべて)", () => {
  render(
    <ScopeProvider>
      <ScopeLabel />
    </ScopeProvider>,
  );
  expect(screen.getByText('表示中: すべて')).toBeInTheDocument();
});

test('initialScope を渡すと、その範囲から始まる', () => {
  const { result } = renderHook(() => useScope(), {
    wrapper: ({ children }) => <ScopeProvider initialScope="team">{children}</ScopeProvider>,
  });
  expect(result.current.scope).toBe('team');
});

test('ScopeSwitcher で切り替えると、離れた場所の ScopeLabel も変わる', async () => {
  const user = userEvent.setup();
  render(
    <ScopeProvider initialScope="mine">
      <header>
        <ScopeSwitcher />
      </header>
      <aside>
        <ScopeLabel />
      </aside>
    </ScopeProvider>,
  );
  expect(screen.getByText('表示中: 自分')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '自分' })).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: 'チーム' }));
  expect(screen.getByText('表示中: チーム')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'チーム' })).toHaveAttribute('aria-pressed', 'true');
});

test('別々の ScopeProvider は、それぞれ独立した scope を持つ', async () => {
  const user = userEvent.setup();
  render(
    <>
      <section aria-label="左">
        <ScopeProvider>
          <ScopeSwitcher />
          <ScopeLabel />
        </ScopeProvider>
      </section>
      <section aria-label="右">
        <ScopeProvider>
          <ScopeSwitcher />
          <ScopeLabel />
        </ScopeProvider>
      </section>
    </>,
  );
  const left = within(screen.getByRole('region', { name: '左' }));
  const right = within(screen.getByRole('region', { name: '右' }));
  await user.click(left.getByRole('button', { name: '自分' }));
  expect(left.getByText('表示中: 自分')).toBeInTheDocument();
  expect(right.getByText('表示中: すべて')).toBeInTheDocument();
});

test("Provider の外で useScope を使うと、'ScopeProvider' を含むエラーを投げる", () => {
  expect(() => renderHook(() => useScope())).toThrow('ScopeProvider');
});
