import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterableFruitList, SearchBox } from './main';

test('SearchBox: props の value が入力欄に表示される', () => {
  render(<SearchBox value="りん" onChange={() => {}} />);
  expect(screen.getByLabelText('検索')).toHaveValue('りん');
});

test('SearchBox: 入力すると onChange が新しい文字列で呼ばれる', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<SearchBox value="" onChange={onChange} />);
  await user.type(screen.getByLabelText('検索'), 'も');
  expect(onChange).toHaveBeenCalledWith('も');
});

test('FilterableFruitList: 入力すると一覧が絞り込まれる', async () => {
  const user = userEvent.setup();
  render(<FilterableFruitList />);
  expect(screen.getByText('5 件')).toBeInTheDocument();
  await user.type(screen.getByLabelText('検索'), 'りんご');
  expect(screen.getByText('2 件')).toBeInTheDocument();
  const items = screen.getAllByRole('listitem');
  expect(items.map((li) => li.textContent)).toEqual(['りんご', 'りんごジュース']);
});

test('FilterableFruitList: 検索語を消すと全件に戻る', async () => {
  const user = userEvent.setup();
  render(<FilterableFruitList />);
  const input = screen.getByLabelText('検索');
  await user.type(input, 'もも');
  expect(screen.getByText('1 件')).toBeInTheDocument();
  await user.clear(input);
  expect(input).toHaveValue('');
  expect(screen.getByText('5 件')).toBeInTheDocument();
});
