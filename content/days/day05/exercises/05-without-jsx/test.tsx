import { render, screen } from '@testing-library/react';
import { Menu, type MenuItem } from './main';

const items: MenuItem[] = [
  { id: 'home', label: 'ホーム', href: '/' },
  { id: 'users', label: 'ユーザー', href: '/users' },
];

test('外側は nav.menu で、見出し h2 に title が表示される', () => {
  const { container } = render(<Menu title="メニュー" items={items} />);
  expect(container.firstElementChild?.tagName).toBe('NAV');
  expect(container.firstElementChild).toHaveAttribute('class', 'menu');
  expect(screen.getByRole('heading', { level: 2, name: 'メニュー' })).toBeInTheDocument();
});

test('items が li > a として順番に並ぶ', () => {
  render(<Menu title="メニュー" items={items} />);
  const links = screen.getAllByRole('link');
  expect(links).toHaveLength(2);
  expect(links[0]).toHaveTextContent('ホーム');
  expect(links[1]).toHaveAttribute('href', '/users');
  expect(links[1].parentElement?.tagName).toBe('LI');
});

test('items が空なら、リンクの無い空の ul になる', () => {
  render(<Menu title="メニュー" items={[]} />);
  expect(screen.getByRole('list')).toBeInTheDocument();
  expect(screen.queryAllByRole('link')).toHaveLength(0);
});
