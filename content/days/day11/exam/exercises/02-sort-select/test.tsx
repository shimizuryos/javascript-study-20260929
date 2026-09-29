import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@study/next-mock';
import { SortSelect } from './main';

const select = () => screen.getByRole('combobox', { name: '並び順' });

test('URL の sort をセレクトボックスの値にする', () => {
  mockRouter.setUrl('/products?sort=old');
  render(<SortSelect />);
  expect(select()).toHaveValue('old');
});

test("sort が無いときは 'new'", () => {
  mockRouter.setUrl('/products?q=shoe');
  render(<SortSelect />);
  expect(select()).toHaveValue('new');
});

test('選ぶと、パスと q を残したまま sort が変わり、page は消える', async () => {
  mockRouter.setUrl('/products?q=shoe&page=3&sort=new');
  render(<SortSelect />);
  await userEvent.selectOptions(select(), 'price');
  expect(mockRouter.pathname).toBe('/products');
  expect(mockRouter.searchParams.get('q')).toBe('shoe');
  expect(mockRouter.searchParams.get('sort')).toBe('price');
  expect(mockRouter.searchParams.has('page')).toBe(false);
  expect(select()).toHaveValue('price');
});

test('router.push で移動する (履歴に積まれる)', async () => {
  mockRouter.setUrl('/products?q=shoe');
  render(<SortSelect />);
  await userEvent.selectOptions(select(), 'old');
  expect(mockRouter.history).toEqual(['/products?q=shoe', '/products?q=shoe&sort=old']);
});
