import { matchRoute } from './main';

test('静的なパス: 同じなら {}、違えば null', () => {
  expect(matchRoute('/users', '/users')).toEqual({});
  expect(matchRoute('/users/new', '/users/new')).toEqual({});
  expect(matchRoute('/users', '/posts')).toBeNull();
});

test('[id]: 1 セグメントを文字列で受け取る', () => {
  expect(matchRoute('/users/[id]', '/users/42')).toEqual({ id: '42' });
  expect(matchRoute('/shop/[category]/[item]', '/shop/shoes/7')).toEqual({ category: 'shoes', item: '7' });
});

test('セグメントの数が違えば null', () => {
  expect(matchRoute('/users/[id]', '/users')).toBeNull();
  expect(matchRoute('/users/[id]', '/users/42/posts')).toBeNull();
});

test('[...slug]: 残りのセグメントを配列で受け取る', () => {
  expect(matchRoute('/docs/[...slug]', '/docs/react')).toEqual({ slug: ['react'] });
  expect(matchRoute('/docs/[...slug]', '/docs/react/hooks/use-state')).toEqual({
    slug: ['react', 'hooks', 'use-state'],
  });
});

test('[...slug]: 1 つも無ければ null', () => {
  expect(matchRoute('/docs/[...slug]', '/docs')).toBeNull();
});

test('(group) は URL に出ないので無視する', () => {
  expect(matchRoute('/(marketing)/about', '/about')).toEqual({});
  expect(matchRoute('/(shop)/products/[id]', '/products/9')).toEqual({ id: '9' });
  expect(matchRoute('/(shop)/products/[id]', '/shop/products/9')).toBeNull();
});
