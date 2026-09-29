import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { describeFilters, FilterSummary, filterParsers } from './main';

function renderAt(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <FilterSummary />
    </NuqsTestingAdapter>,
  );
  return onUrlUpdate;
}

/** 最後に書き込まれた URL のクエリ (URLSearchParams) */
async function lastUrl(onUrlUpdate: ReturnType<typeof renderAt>) {
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  return onUrlUpdate.mock.calls.at(-1)![0].searchParams;
}

test("filterParsers のキーは 'scope' / 'page' / 'q' で、パーサーが URL の文字列を変換する", () => {
  expect(Object.keys(filterParsers).sort()).toEqual(['page', 'q', 'scope']);
  const parsers = filterParsers as Record<string, { parse: (v: string) => unknown; defaultValue?: unknown }>;
  expect(parsers.scope.parse('mine')).toBe('mine');
  expect(parsers.scope.parse('admin')).toBeNull();
  expect(parsers.page.parse('2')).toBe(2);
  expect(parsers.q.parse('react')).toBe('react');
  expect([parsers.scope.defaultValue, parsers.page.defaultValue, parsers.q.defaultValue]).toEqual(['all', 1, undefined]);
});

test('describeFilters: 条件を 1 行の文字列にする', () => {
  expect(describeFilters({ scope: 'mine', page: 2, q: 'react' })).toBe('mine / 2 ページ / react');
  expect(describeFilters({ scope: 'all', page: 1, q: null })).toBe('all / 1 ページ / (検索なし)');
});

test('URL の条件を表示する', () => {
  renderAt('?scope=mine&page=2&q=react');
  expect(screen.getByText('mine / 2 ページ / react')).toBeInTheDocument();
});

test('URL に無い・不正な値はデフォルト値になる', () => {
  renderAt('?scope=admin&page=x');
  expect(screen.getByText('all / 1 ページ / (検索なし)')).toBeInTheDocument();
});

test('「チームに切り替え」: scope=team になり、page は消え、q は残る', async () => {
  const onUrlUpdate = renderAt('?page=3&q=react');
  await userEvent.click(screen.getByRole('button', { name: 'チームに切り替え' }));
  expect(screen.getByText('team / 1 ページ / react')).toBeInTheDocument();
  const url = await lastUrl(onUrlUpdate);
  expect(url.get('scope')).toBe('team');
  expect(url.has('page')).toBe(false);
  expect(url.get('q')).toBe('react');
});

test('「条件をリセット」: scope / page / q が消え、関係のない tab は残る', async () => {
  const onUrlUpdate = renderAt('?scope=mine&page=2&q=react&tab=info');
  await userEvent.click(screen.getByRole('button', { name: '条件をリセット' }));
  expect(screen.getByText('all / 1 ページ / (検索なし)')).toBeInTheDocument();
  const url = await lastUrl(onUrlUpdate);
  expect(url.toString()).toBe('tab=info');
});
