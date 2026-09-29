import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { MembersTable } from './main';

/** URL を決めて MembersTable を表示する */
function setup(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <QueryClientProvider client={queryClient}>
        <MembersTable />
      </QueryClientProvider>
    </NuqsTestingAdapter>,
  );
  /** 最後に書き込まれた URL のクエリ */
  const lastUrl = () => onUrlUpdate.mock.calls.at(-1)?.[0].searchParams ?? new URLSearchParams();
  return { user: userEvent.setup(), lastUrl };
}

test('URL が空なら 1 ページ目の 5 人と「1 / 3 ページ (全 12 件)」が表示され、「前へ」は押せない', async () => {
  setup('');
  expect(await screen.findByText('佐藤')).toBeInTheDocument();
  expect(screen.getByText('伊藤')).toBeInTheDocument();
  expect(screen.queryByText('渡辺')).not.toBeInTheDocument();
  expect(screen.getByText(/1 \/ 3 ページ/)).toHaveTextContent('全 12 件');
  expect(screen.getByRole('button', { name: '前へ' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '次へ' })).toBeEnabled();
});

test('「次へ」を押すと URL が page=2 になり、2 ページ目のメンバーが表示される', async () => {
  const { user, lastUrl } = setup('');
  await screen.findByText('佐藤');
  await user.click(screen.getByRole('button', { name: '次へ' }));
  await waitFor(() => expect(lastUrl().get('page')).toBe('2'));
  expect(await screen.findByText('渡辺')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('佐藤')).not.toBeInTheDocument());
  expect(screen.getByText(/2 \/ 3 ページ/)).toBeInTheDocument();
});

test('URL が ?page=3 なら最後のページから始まり、「次へ」は押せない。「前へ」で page=2 になる', async () => {
  const { user, lastUrl } = setup('?page=3');
  expect(await screen.findByText('吉田')).toBeInTheDocument();
  expect(screen.getByText(/3 \/ 3 ページ/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '次へ' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '前へ' }));
  await waitFor(() => expect(lastUrl().get('page')).toBe('2'));
  expect(await screen.findByText('渡辺')).toBeInTheDocument();
});

test('「表示範囲」で「自分のチーム」を選ぶと URL が scope=team になり、page は消える', async () => {
  const { user, lastUrl } = setup('?page=2');
  await screen.findByText('渡辺');
  const select = screen.getByLabelText('表示範囲');
  expect(select).toHaveValue('all');
  await user.selectOptions(select, '自分のチーム');
  await waitFor(() => expect(lastUrl().get('scope')).toBe('team'));
  expect(lastUrl().has('page')).toBe(false);
  expect(await screen.findByText('佐藤')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/1 \/ 2 ページ/)).toHaveTextContent('全 6 件'));
});
