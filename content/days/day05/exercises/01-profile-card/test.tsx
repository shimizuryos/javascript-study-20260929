import { render, screen } from '@testing-library/react';
import { Avatar, ProfileCard } from './main';

test('Avatar: 名前の 1 文字目を表示し、aria-label に名前が入る', () => {
  render(<Avatar name="Alice" />);
  expect(screen.getByLabelText('Alice')).toHaveTextContent('A');
});

test('Avatar: size を省略すると 40px、指定するとその大きさ', () => {
  render(
    <>
      <Avatar name="Alice" />
      <Avatar name="Bob" size={64} />
    </>,
  );
  expect(screen.getByLabelText('Alice').style.width).toBe('40px');
  expect(screen.getByLabelText('Bob').style.height).toBe('64px');
});

test('ProfileCard: 名前が h2 の見出しに、役割が p.role に表示される', () => {
  render(<ProfileCard name="Alice" role="管理者" />);
  expect(screen.getByRole('heading', { level: 2, name: 'Alice' })).toBeInTheDocument();
  expect(screen.getByText('管理者')).toHaveAttribute('class', 'role');
});

test("ProfileCard: role を省略すると 'メンバー' と表示される", () => {
  render(<ProfileCard name="Bob" />);
  expect(screen.getByText('メンバー')).toBeInTheDocument();
});

test('ProfileCard: 外側は section.profile-card で、Avatar と children が中に表示される', () => {
  const { container } = render(
    <ProfileCard name="Alice">
      <p>React を勉強中です。</p>
    </ProfileCard>,
  );
  const card = container.firstElementChild;
  expect(card?.tagName).toBe('SECTION');
  expect(card).toHaveAttribute('class', 'profile-card');
  expect(screen.getByText('React を勉強中です。').closest('.profile-card')).toBe(card);
  expect(screen.getByLabelText('Alice').closest('.profile-card')).toBe(card);
});
