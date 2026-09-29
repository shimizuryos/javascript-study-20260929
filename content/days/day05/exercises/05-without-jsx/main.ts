import { createElement } from 'react';

export type MenuItem = { id: string; label: string; href: string };

export function Menu({ title, items }: { title: string; items: MenuItem[] }) {
  return createElement(
    'nav',
    { className: 'menu' },
    createElement('h2', null, title),
    createElement(
      'ul',
      null,
      items.map((item) => createElement('li', { key: item.id }, createElement('a', { href: item.href }, item.label))),
    ),
  );
}
