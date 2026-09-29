import { Profiler } from 'react';
import { render, screen } from '@testing-library/react';
import { SearchResults, type SearchOptions } from './main';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function setup(q: string) {
  // 疑似 API: 10ms 後に結果を返す
  const search = vi.fn(async (options: SearchOptions) => {
    await sleep(10);
    return [`${options.q} の結果 1`, `${options.q} の結果 2`];
  });
  let renders = 0;
  const ui = (q: string) => (
    <Profiler id="results" onRender={() => renders++}>
      <SearchResults q={q} search={search} />
    </Profiler>
  );
  const utils = render(ui(q));
  return {
    search,
    rerender: (q: string) => utils.rerender(ui(q)),
    renderCount: () => renders,
  };
}

test('検索結果が表示される', async () => {
  const { search } = setup('react');
  expect(await screen.findByText('react の結果 1')).toBeInTheDocument();
  expect(search).toHaveBeenCalledWith({ q: 'react', limit: 10 });
});

test('結果が表示された後、search はもう呼ばれない (合計 1 回)', async () => {
  const { search } = setup('react');
  await screen.findByText('react の結果 1');
  await sleep(150);
  expect(search).toHaveBeenCalledTimes(1);
});

test('再レンダーが止まる (最初の表示 + 結果の表示 で、数回で落ち着く)', async () => {
  const { renderCount } = setup('react');
  await screen.findByText('react の結果 1');
  await sleep(150);
  expect(renderCount()).toBeLessThanOrEqual(3);
});

test('q が変わったら、新しい q で 1 回だけ検索し直す', async () => {
  const { search, rerender } = setup('react');
  await screen.findByText('react の結果 1');
  rerender('vue');
  expect(await screen.findByText('vue の結果 1')).toBeInTheDocument();
  await sleep(100);
  expect(search).toHaveBeenCalledTimes(2);
  expect(search).toHaveBeenLastCalledWith({ q: 'vue', limit: 10 });
});
