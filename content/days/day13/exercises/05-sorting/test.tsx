import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortableTable, type Person } from './main';

const people: Person[] = [
  { id: 1, name: 'Sato', age: 34 },
  { id: 2, name: 'Aoki', age: 28 },
  { id: 3, name: 'Kato', age: 41 },
  { id: 4, name: 'Ito', age: 25 },
];

/** 指定した列 (0: 名前, 1: 年齢) の値を、表示順に並べる */
function column(index: number) {
  const [, ...rows] = screen.getAllByRole('row');
  return rows.map((row) => within(row).getAllByRole('cell')[index].textContent);
}
const header = (name: RegExp) => screen.getByRole('button', { name });

test('最初は渡した順のまま', () => {
  render(<SortableTable people={people} />);
  expect(column(0)).toEqual(['Sato', 'Aoki', 'Kato', 'Ito']);
});

test('「名前」を 1 回押すと昇順になり、見出しに ▲ が付く', async () => {
  render(<SortableTable people={people} />);
  await userEvent.click(header(/名前/));
  expect(column(0)).toEqual(['Aoki', 'Ito', 'Kato', 'Sato']);
  expect(header(/名前/)).toHaveTextContent('名前 ▲');
});

test('「名前」を 2 回押すと降順、3 回押すと元の順に戻る', async () => {
  render(<SortableTable people={people} />);
  await userEvent.click(header(/名前/));
  await userEvent.click(header(/名前/));
  expect(column(0)).toEqual(['Sato', 'Kato', 'Ito', 'Aoki']);
  expect(header(/名前/)).toHaveTextContent('名前 ▼');
  await userEvent.click(header(/名前/));
  expect(column(0)).toEqual(['Sato', 'Aoki', 'Kato', 'Ito']);
});

test('数値の列 (年齢) は降順から始まる', async () => {
  render(<SortableTable people={people} />);
  await userEvent.click(header(/年齢/));
  expect(column(1)).toEqual(['41', '34', '28', '25']);
  expect(header(/年齢/)).toHaveTextContent('年齢 ▼');
});
