import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { IssueList, statusParser, type Issue } from './main';

const issues: Issue[] = [
  { id: 1, title: 'ログインできない', status: 'open' },
  { id: 2, title: '表示が崩れる', status: 'closed' },
  { id: 3, title: '検索が遅い', status: 'open' },
];

function renderAt(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <IssueList issues={issues} />
    </NuqsTestingAdapter>,
  );
  return onUrlUpdate;
}

const titles = () => screen.getAllByRole('listitem').map((li) => li.textContent);
const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed');

test('statusParser: 決まった値だけを受け付ける', () => {
  expect(statusParser.parse('closed')).toBe('closed');
  expect(statusParser.parse('done')).toBeNull();
});

test('?status=open なら未対応の課題だけを表示する', () => {
  renderAt('?status=open');
  expect(titles()).toEqual(['ログインできない', '検索が遅い']);
  expect(pressed('未対応')).toBe('true');
});

test('想定外の値 (?status=done) は「すべて」として扱う', () => {
  renderAt('?status=done');
  expect(titles()).toHaveLength(3);
  expect(pressed('すべて')).toBe('true');
});

test('「完了」を押すと URL が ?status=closed になり、一覧が絞り込まれる', async () => {
  const onUrlUpdate = renderAt('');
  await userEvent.click(screen.getByRole('button', { name: '完了' }));
  expect(titles()).toEqual(['表示が崩れる']);
  await waitFor(() => expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toBe('?status=closed'));
});

test('「すべて」を押すと URL から status が消える', async () => {
  const onUrlUpdate = renderAt('?status=open');
  await userEvent.click(screen.getByRole('button', { name: 'すべて' }));
  expect(titles()).toHaveLength(3);
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toBe('');
});
