import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserPage from './main';

// Next.js は URL の [id] 部分を Promise に包んで params として渡す。テストでも同じ形で渡す
const paramsOf = (id: string) => Promise.resolve({ id });

test('UserPage は async 関数 (呼ぶと Promise が返る)', async () => {
  const result = UserPage({ params: paramsOf('1') });
  expect(result).toBeInstanceOf(Promise);
  await result;
});

test('id: "1" なら Alice のページを表示する', async () => {
  render(await UserPage({ params: paramsOf('1') }));
  expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
  expect(screen.getByText('フロントエンドエンジニア')).toBeInTheDocument();
});

test('id: "2" なら Bob のページを表示する', async () => {
  render(await UserPage({ params: paramsOf('2') }));
  expect(screen.getByRole('heading', { name: 'Bob' })).toBeInTheDocument();
  expect(screen.getByText('バックエンドエンジニア')).toBeInTheDocument();
});

test('LikeButton (Client Component) にいいね数を渡していて、クリックで増える', async () => {
  const user = userEvent.setup();
  render(await UserPage({ params: paramsOf('2') }));
  await user.click(screen.getByRole('button', { name: '♥ 10' }));
  expect(screen.getByRole('button', { name: '♥ 11' })).toBeInTheDocument();
});

test('「一覧へ戻る」リンクが /users を指している', async () => {
  render(await UserPage({ params: paramsOf('1') }));
  expect(screen.getByRole('link', { name: '一覧へ戻る' })).toHaveAttribute('href', '/users');
});

test('存在しない id なら notFound() を呼ぶ (NEXT_NOT_FOUND が投げられる)', async () => {
  // notFound() は「NEXT_NOT_FOUND」という例外を投げて処理を止める (このモックの場合)
  await expect(UserPage({ params: paramsOf('999') })).rejects.toHaveProperty('message', 'NEXT_NOT_FOUND');
});
