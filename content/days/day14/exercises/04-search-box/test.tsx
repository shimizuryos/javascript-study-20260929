import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { MemberSearch } from './main';

function setup(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <QueryClientProvider client={queryClient}>
        <MemberSearch />
      </QueryClientProvider>
    </NuqsTestingAdapter>,
  );
  /** 最後に書き込まれた URL のクエリ (まだ書き込まれていなければ null) */
  const lastUrl = () => onUrlUpdate.mock.calls.at(-1)?.[0].searchParams ?? null;
  const names = () => screen.queryAllByRole('listitem').map((li) => li.textContent);
  return { user: userEvent.setup(), lastUrl, names };
}

test('URL の ?q=山 が入力欄に入っていて、山本・山田の 2 件が表示される', async () => {
  const { names } = setup('?q=山');
  expect(screen.getByLabelText('名前で検索')).toHaveValue('山');
  await waitFor(() => expect(names()).toEqual(['山本', '山田']));
  expect(screen.getByText('該当 2 件')).toBeInTheDocument();
});

test('「田」と入力すると URL が q=田 になり、page は消えて 1 ページ目の結果が表示される', async () => {
  const { user, lastUrl, names } = setup('?page=2');
  await waitFor(() => expect(names()).toContain('渡辺'));
  await user.type(screen.getByLabelText('名前で検索'), '田');
  await waitFor(() => expect(lastUrl()?.get('q')).toBe('田'));
  expect(lastUrl()?.has('page')).toBe(false);
  await waitFor(() => expect(names()).toEqual(['田中', '吉田', '山田']));
});

test('「クリア」を押すと q が URL から消え、全 12 件に戻る。検索語が無いときは押せない', async () => {
  const { user, lastUrl } = setup('?q=田');
  const clear = screen.getByRole('button', { name: 'クリア' });
  await screen.findByText('該当 3 件');
  await user.click(clear);
  await waitFor(() => expect(lastUrl()?.has('q')).toBe(false));
  expect(screen.getByLabelText('名前で検索')).toHaveValue('');
  expect(await screen.findByText('該当 12 件')).toBeInTheDocument();
  expect(clear).toBeDisabled();
});
