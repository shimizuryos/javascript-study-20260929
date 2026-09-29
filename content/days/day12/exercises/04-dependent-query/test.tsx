import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { projectCalls } from './api';
import { UserProjects } from './main';

function renderFor(email: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <UserProjects email={email} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  projectCalls.length = 0;
});

test('ユーザー → プロジェクトの順に取得して表示する', async () => {
  renderFor('sato@example.com');
  expect(screen.getByText('ユーザーを読み込み中…')).toBeInTheDocument();
  expect(await screen.findByText('佐藤 さんのプロジェクト')).toBeInTheDocument();
  expect(await screen.findByText('社内ポータル')).toBeInTheDocument();
  expect(screen.getByText('採用サイト')).toBeInTheDocument();
});

test('fetchProjects は userId が決まってから 1 回だけ呼ばれる (undefined では呼ばれない)', async () => {
  renderFor('sato@example.com');
  await screen.findByText('社内ポータル');
  expect(projectCalls).toEqual([1]);
});

test('ユーザーが見つからないときは、fetchProjects を 1 回も呼ばない', async () => {
  renderFor('nobody@example.com');
  expect(await screen.findByText('エラー: ユーザーが見つかりません')).toBeInTheDocument();
  expect(projectCalls).toEqual([]);
});
