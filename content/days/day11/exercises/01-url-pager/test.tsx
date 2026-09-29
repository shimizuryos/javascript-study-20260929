import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { Pager } from './main';

/** URL のクエリを指定して描画し、URL の更新を記録する関数を返す */
function renderAt(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <Pager />
    </NuqsTestingAdapter>,
  );
  return onUrlUpdate;
}

test('URL が ?page=3 なら「3 ページ目」と表示する', () => {
  renderAt('?page=3');
  expect(screen.getByText('3 ページ目')).toBeInTheDocument();
});

test('page が無いときは 1 ページ目で、「前へ」は押せない', () => {
  renderAt('');
  expect(screen.getByText('1 ページ目')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '前へ' })).toBeDisabled();
});

test('?page=abc のような不正な値は 1 ページ目として扱う', () => {
  renderAt('?page=abc');
  expect(screen.getByText('1 ページ目')).toBeInTheDocument();
});

test('「次へ」を押すと 4 ページ目になり、URL が ?page=4 になる', async () => {
  const onUrlUpdate = renderAt('?page=3');
  await userEvent.click(screen.getByRole('button', { name: '次へ' }));
  expect(screen.getByText('4 ページ目')).toBeInTheDocument();
  // URL の書き換えは少し遅れて行われるので waitFor で待つ
  await waitFor(() => expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toBe('?page=4'));
});

test('2 ページ目で「前へ」を押すと、URL から page が消える', async () => {
  const onUrlUpdate = renderAt('?page=2');
  await userEvent.click(screen.getByRole('button', { name: '前へ' }));
  expect(screen.getByText('1 ページ目')).toBeInTheDocument();
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.has('page')).toBe(false);
});
