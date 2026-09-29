import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentList, type Doc } from './main';

const sample = (): Doc[] => [
  { id: 1, title: '議事録', owner: 'me', starred: false },
  { id: 2, title: '設計書', owner: 'team', starred: true },
  { id: 3, title: '日報', owner: 'me', starred: false },
];

// 各行のテキストから ★ / ☆ を除いたもの (= タイトル)
const titles = () => screen.getAllByRole('listitem').map((li) => li.textContent?.replace(/[★☆]/g, '').trim());

test('最初は「すべて」が選択中で、全件と件数が表示される', () => {
  render(<DocumentList initialDocs={sample()} />);
  expect(screen.getByRole('button', { name: 'すべて' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: '自分' })).toHaveAttribute('aria-pressed', 'false');
  expect(titles()).toEqual(['議事録', '設計書', '日報']);
  expect(screen.getByText('3 件')).toBeInTheDocument();
});

test('「自分」「チーム」で絞り込まれ、件数も変わる', async () => {
  const user = userEvent.setup();
  render(<DocumentList initialDocs={sample()} />);
  await user.click(screen.getByRole('button', { name: '自分' }));
  expect(screen.getByRole('button', { name: '自分' })).toHaveAttribute('aria-pressed', 'true');
  expect(titles()).toEqual(['議事録', '日報']);
  expect(screen.getByText('2 件')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'チーム' }));
  expect(titles()).toEqual(['設計書']);
  expect(screen.getByText('1 件')).toBeInTheDocument();
});

test('0 件のときは「該当するドキュメントはありません」を表示し、<ul> は出さない', async () => {
  const user = userEvent.setup();
  render(<DocumentList initialDocs={sample().filter((d) => d.owner === 'me')} />);
  await user.click(screen.getByRole('button', { name: 'チーム' }));
  expect(screen.getByText('該当するドキュメントはありません')).toBeInTheDocument();
  expect(screen.getByText('0 件')).toBeInTheDocument();
  expect(screen.queryByRole('list')).toBeNull();
});

test('お気に入りボタンで starred が切り替わり、initialDocs は変更されない', async () => {
  const user = userEvent.setup();
  const initialDocs = sample();
  render(<DocumentList initialDocs={initialDocs} />);
  const star = screen.getByRole('button', { name: '議事録 をお気に入り' });
  expect(star).toHaveAttribute('aria-pressed', 'false');
  expect(star).toHaveTextContent('☆');
  await user.click(star);
  expect(screen.getByRole('button', { name: '議事録 をお気に入り' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: '議事録 をお気に入り' })).toHaveTextContent('★');
  expect(initialDocs).toEqual(sample());
});

test('絞り込みを切り替えても、お気に入りの状態は保たれる', async () => {
  const user = userEvent.setup();
  render(<DocumentList initialDocs={sample()} />);
  await user.click(screen.getByRole('button', { name: '日報 をお気に入り' }));
  await user.click(screen.getByRole('button', { name: 'チーム' }));
  await user.click(screen.getByRole('button', { name: '自分' }));
  expect(screen.getByRole('button', { name: '日報 をお気に入り' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: '議事録 をお気に入り' })).toHaveAttribute('aria-pressed', 'false');
});
