import { render, screen, within } from '@testing-library/react';
import { UserTable } from './main';
import { USERS } from './users';

/** <tbody> の行ごとに、セルの文字列を配列にする */
function bodyRows() {
  const [, ...rows] = screen.getAllByRole('row'); // 1 行目は見出しの行
  return rows.map((row) =>
    within(row)
      .getAllByRole('cell')
      .map((cell) => cell.textContent),
  );
}

test('見出しは「名前・メール・役割」の順', () => {
  render(<UserTable users={USERS} />);
  expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['名前', 'メール', '役割']);
});

test('データの件数だけ行がある', () => {
  render(<UserTable users={USERS} />);
  expect(bodyRows()).toHaveLength(4);
});

test('名前は「姓 名」、役割は日本語で表示する', () => {
  render(<UserTable users={USERS} />);
  expect(bodyRows()[0]).toEqual(['山田 太郎', 'taro@example.com', '管理者']);
  expect(bodyRows()[1]).toEqual(['佐藤 花子', 'hanako@example.com', 'メンバー']);
});

test('渡したデータがそのまま行になる (1 件だけ渡したとき)', () => {
  render(<UserTable users={[USERS[2]]} />);
  expect(bodyRows()).toEqual([['鈴木 次郎', 'jiro@example.com', 'メンバー']]);
});
