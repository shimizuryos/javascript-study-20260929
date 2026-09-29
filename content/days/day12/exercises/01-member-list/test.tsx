import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { calls } from './api';
import { MemberList } from './main';

/** テストごとに新しい QueryClient (キャッシュ) を作って囲む */
function renderWithClient(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  calls.length = 0;
});

test('最初は「読み込み中…」を表示する', () => {
  renderWithClient(<MemberList teamId="design" />);
  expect(screen.getByText('読み込み中…')).toBeInTheDocument();
});

test('取得できたらメンバーの名前を一覧にする', async () => {
  renderWithClient(<MemberList teamId="dev" />);
  expect(await screen.findByText('高橋')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['高橋', '田中', '伊藤']);
  expect(calls).toEqual(['dev']);
});

test('失敗したらエラーメッセージを表示する', async () => {
  renderWithClient(<MemberList teamId="unknown" />);
  expect(await screen.findByText('エラー: チーム unknown が見つかりません')).toBeInTheDocument();
});

test('同じキーの MemberList が 2 つあっても、取得は 1 回だけ', async () => {
  renderWithClient(
    <>
      <MemberList teamId="design" />
      <MemberList teamId="design" />
    </>,
  );
  expect(await screen.findAllByText('佐藤')).toHaveLength(2);
  expect(calls).toEqual(['design']);
});
