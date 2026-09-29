import { render, screen } from '@testing-library/react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Providers } from './main';

/** TanStack Query の Provider の中にいれば、useQueryClient() で QueryClient を取り出せる */
function QueryClientProbe({ onRender }: { onRender?: (client: QueryClient) => void }) {
  const client = useQueryClient();
  onRender?.(client);
  return <p>QueryClient: OK</p>;
}

/** nuqs のアダプターの中にいれば、useQueryState() で URL のクエリを読める */
function SearchProbe() {
  const [q] = useQueryState('q');
  return <p>検索語: {q ?? 'なし'}</p>;
}

test('children をそのまま表示する', () => {
  render(
    <Providers>
      <p>ページの本文</p>
    </Providers>,
  );
  expect(screen.getByText('ページの本文')).toBeInTheDocument();
});

test('中のコンポーネントで useQueryClient() が使える', () => {
  render(
    <Providers>
      <QueryClientProbe />
    </Providers>,
  );
  expect(screen.getByText('QueryClient: OK')).toBeInTheDocument();
});

test('中のコンポーネントで nuqs の useQueryState() が使える (NuqsAdapter で囲まれている)', () => {
  render(
    <Providers>
      <SearchProbe />
    </Providers>,
  );
  expect(screen.getByText('検索語: なし')).toBeInTheDocument();
});

test('再レンダーしても同じ QueryClient が使われ、キャッシュが残る', () => {
  const seen: QueryClient[] = [];
  const ui = () => (
    <Providers>
      <QueryClientProbe onRender={(client) => seen.push(client)} />
    </Providers>
  );
  const { rerender } = render(ui());
  seen[0].setQueryData(['greeting'], 'こんにちは');

  rerender(ui()); // 親が再レンダーされた状況を再現する

  const latest = seen[seen.length - 1];
  expect(seen.length).toBeGreaterThanOrEqual(2);
  expect(latest).toBe(seen[0]);
  expect(latest.getQueryData(['greeting'])).toBe('こんにちは');
});
