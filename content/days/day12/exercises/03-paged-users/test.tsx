import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { requests } from './api';
import { PagedUsers } from './main';

function renderUsers() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PagedUsers />
    </QueryClientProvider>,
  );
}

const names = () => screen.getAllByRole('listitem').map((li) => li.textContent);
const nextButton = () => screen.getByRole('button', { name: '次へ' });

beforeEach(() => {
  requests.length = 0;
});

test('最初は「読み込み中…」、そのあと 1 ページ目を表示する', async () => {
  renderUsers();
  expect(screen.getByText('読み込み中…')).toBeInTheDocument();
  expect(await screen.findByText('ユーザー1')).toBeInTheDocument();
  expect(names()).toEqual(['ユーザー1', 'ユーザー2', 'ユーザー3']);
});

test('「次へ」を押した直後も前のページを表示し続け、「更新中…」を出して「次へ」を押せなくする', async () => {
  renderUsers();
  await screen.findByText('ユーザー1');
  await userEvent.click(nextButton());
  expect(screen.queryByText('読み込み中…')).toBeNull();
  expect(names()).toEqual(['ユーザー1', 'ユーザー2', 'ユーザー3']);
  expect(screen.getByText('更新中…')).toBeInTheDocument();
  expect(nextButton()).toBeDisabled();
  // 2 ページ目が届いたら入れ替わる
  expect(await screen.findByText('ユーザー4')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('更新中…')).toBeNull());
  expect(nextButton()).toBeEnabled();
});

test('最後のページでは「次へ」を押せない', async () => {
  renderUsers();
  await screen.findByText('ユーザー1');
  await userEvent.click(nextButton());
  await screen.findByText('ユーザー4');
  await waitFor(() => expect(nextButton()).toBeEnabled());
  await userEvent.click(nextButton());
  expect(await screen.findByText('ユーザー7')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('更新中…')).toBeNull());
  expect(nextButton()).toBeDisabled();
});

test('queryFn が受け取った signal を fetchUsersPage に渡している', async () => {
  renderUsers();
  await screen.findByText('ユーザー1');
  expect(requests).toHaveLength(1);
  expect(requests[0].signal).toBeInstanceOf(AbortSignal);
});
