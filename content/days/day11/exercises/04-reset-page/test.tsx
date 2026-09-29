import type { ReactNode } from 'react';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { SearchPanel, useSearch } from './main';

function renderAt(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <SearchPanel />
    </NuqsTestingAdapter>,
  );
  return onUrlUpdate;
}

/** 最後に書き込まれた URL のクエリ (まだ書き込まれていなければ空) */
const latest = (onUrlUpdate: ReturnType<typeof renderAt>) =>
  onUrlUpdate.mock.calls.at(-1)?.[0].searchParams ?? new URLSearchParams();

test('URL の q と page を表示する', () => {
  renderAt('?q=old&page=5');
  expect(screen.getByRole('textbox', { name: '検索' })).toHaveValue('old');
  expect(screen.getByText('5 ページ目')).toBeInTheDocument();
});

test('検索語を変えると 1 ページ目に戻り、URL から page が消える', async () => {
  const onUrlUpdate = renderAt('?q=old&page=5');
  const input = screen.getByRole('textbox', { name: '検索' });
  await userEvent.clear(input);
  await userEvent.type(input, 'new');
  expect(screen.getByText('1 ページ目')).toBeInTheDocument();
  // URL の書き換えは少し遅れて行われるので waitFor で待つ
  await waitFor(() => expect(latest(onUrlUpdate).get('q')).toBe('new'));
  expect(latest(onUrlUpdate).has('page')).toBe(false);
});

test('検索欄を空にすると、URL から q が消える', async () => {
  const onUrlUpdate = renderAt('?q=old');
  await userEvent.clear(screen.getByRole('textbox', { name: '検索' }));
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(latest(onUrlUpdate).has('q')).toBe(false);
});

test('「次へ」は page だけを 1 増やす', async () => {
  const onUrlUpdate = renderAt('?q=old&page=5');
  await userEvent.click(screen.getByRole('button', { name: '次へ' }));
  expect(screen.getByText('6 ページ目')).toBeInTheDocument();
  await waitFor(() => expect(latest(onUrlUpdate).get('page')).toBe('6'));
  expect(latest(onUrlUpdate).get('q')).toBe('old');
});

test('useSearch: setSearch の Promise を待つと、URL は ?q=react だけになっている', async () => {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams="?q=old&page=5" onUrlUpdate={onUrlUpdate} hasMemory>
      {children}
    </NuqsTestingAdapter>
  );
  const { result } = renderHook(() => useSearch(), { wrapper });
  await act(() => result.current.setSearch('react'));
  expect(result.current.page).toBe(1);
  expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toBe('?q=react');
});
