import { act, render, screen } from '@testing-library/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { THEME_KEY, ThemeLabel } from './main';

afterEach(() => localStorage.removeItem(THEME_KEY));

/**
 * hydration を再現する。
 * 1. localStorage が空の状態で描画した DOM を「サーバーが返した HTML」とする (サーバーには localStorage が無いため)
 * 2. localStorage に savedTheme を保存する (ユーザーのブラウザの状態)
 * 3. その DOM に対して hydrateRoot を呼び、React が報告した hydration エラーを集める
 */
async function hydrateWithSavedTheme(savedTheme: string) {
  const serverContainer = document.createElement('div');
  const serverRoot = createRoot(serverContainer);
  await act(async () => serverRoot.render(<ThemeLabel />));
  const serverHtml = Array.from(serverContainer.childNodes, (node) => node.cloneNode(true));
  act(() => serverRoot.unmount());

  localStorage.setItem(THEME_KEY, savedTheme);

  const container = document.createElement('div');
  container.append(...serverHtml);
  document.body.append(container);
  const errors: string[] = [];
  const root = await act(async () =>
    hydrateRoot(container, <ThemeLabel />, {
      onRecoverableError: (error) => errors.push(error instanceof Error ? error.message : String(error)),
    }),
  );
  const cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { errors, container, cleanup };
}

test('保存された値が無ければ「テーマ: light」', () => {
  render(<ThemeLabel />);
  expect(screen.getByText('テーマ: light')).toBeInTheDocument();
});

test('保存された値があれば (ブラウザだけで描画したとき)「テーマ: dark」になる', async () => {
  localStorage.setItem(THEME_KEY, 'dark');
  render(<ThemeLabel />);
  expect(await screen.findByText('テーマ: dark')).toBeInTheDocument();
});

test('hydration でエラーにならない (サーバーの HTML と最初の描画が一致する)', async () => {
  const { errors, cleanup } = await hydrateWithSavedTheme('dark');
  try {
    expect(errors).toEqual([]);
  } finally {
    cleanup();
  }
});

test('hydration の後には、保存された値「テーマ: dark」が表示される', async () => {
  const { container, cleanup } = await hydrateWithSavedTheme('dark');
  try {
    expect(container).toHaveTextContent('テーマ: dark');
  } finally {
    cleanup();
  }
});
