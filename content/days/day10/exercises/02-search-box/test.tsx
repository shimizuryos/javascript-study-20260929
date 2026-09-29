import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@study/next-mock';
import { SearchBox } from './main';

/** 入力欄を空にしてから text を入力し、「検索」を押す */
async function search(text: string) {
  const user = userEvent.setup();
  const input = screen.getByRole('textbox', { name: '検索語' });
  await user.clear(input);
  if (text) await user.type(input, text);
  await user.click(screen.getByRole('button', { name: '検索' }));
}

test('最初は URL の q が入力欄に入っている', () => {
  mockRouter.setUrl('/products?q=shoe');
  render(<SearchBox />);
  expect(screen.getByRole('textbox', { name: '検索語' })).toHaveValue('shoe');
});

test('検索すると q が変わり、パスと他のクエリ (sort, tags) は残る', async () => {
  mockRouter.setUrl('/products?sort=new&q=shoe&tags=red&tags=blue');
  render(<SearchBox />);
  await search('boots');

  expect(mockRouter.pathname).toBe('/products');
  const params = mockRouter.searchParams;
  expect(params.get('q')).toBe('boots');
  expect(params.get('sort')).toBe('new');
  expect(params.getAll('tags')).toEqual(['red', 'blue']);
});

test('検索すると page は URL から消える (1 ページ目に戻る)', async () => {
  mockRouter.setUrl('/products?q=shoe&page=3');
  render(<SearchBox />);
  await search('boots');
  expect(mockRouter.searchParams.has('page')).toBe(false);
});

test('空で検索すると q が URL から消える', async () => {
  mockRouter.setUrl('/products?sort=new&q=shoe');
  render(<SearchBox />);
  await search('');
  expect(mockRouter.url).toBe('/products?sort=new');
});

test('router.replace を使っている (検索しても履歴が増えない)', async () => {
  mockRouter.setUrl('/products');
  render(<SearchBox />);
  await search('boots');
  expect(mockRouter.history).toEqual(['/products?q=boots']);
});
