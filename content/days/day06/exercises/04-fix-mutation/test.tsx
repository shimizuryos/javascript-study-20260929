import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagPicker } from './main';

const selected = () => screen.getAllByRole('listitem').map((li) => li.textContent?.replace('×', ''));

test('最初は initialTags が選択中として表示される', () => {
  render(<TagPicker initialTags={['JavaScript']} />);
  expect(selected()).toEqual(['JavaScript']);
  expect(screen.getByText('選択中: 1 件')).toBeInTheDocument();
});

test('おすすめタグを押すと、選択中に追加されて件数も増える', async () => {
  const user = userEvent.setup();
  render(<TagPicker initialTags={['JavaScript']} />);
  await user.click(screen.getByRole('button', { name: 'React' }));
  expect(selected()).toEqual(['JavaScript', 'React']);
  expect(screen.getByText('選択中: 2 件')).toBeInTheDocument();
});

test('同じタグは 2 回追加されない', async () => {
  const user = userEvent.setup();
  render(<TagPicker initialTags={[]} />);
  await user.click(screen.getByRole('button', { name: 'Next.js' }));
  await user.click(screen.getByRole('button', { name: 'Next.js' }));
  expect(selected()).toEqual(['Next.js']);
});

test('親から渡された initialTags の配列は変更されない', async () => {
  const user = userEvent.setup();
  const initialTags = ['JavaScript'];
  render(<TagPicker initialTags={initialTags} />);
  await user.click(screen.getByRole('button', { name: 'TypeScript' }));
  expect(initialTags).toEqual(['JavaScript']);
});

test('× ボタンで選択を外せる', async () => {
  const user = userEvent.setup();
  render(<TagPicker initialTags={['JavaScript', 'React']} />);
  await user.click(screen.getByRole('button', { name: 'JavaScript を外す' }));
  expect(selected()).toEqual(['React']);
});
