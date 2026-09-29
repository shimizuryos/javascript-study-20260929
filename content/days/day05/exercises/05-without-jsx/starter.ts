import { createElement } from 'react';

export type MenuItem = { id: string; label: string; href: string };

export function Menu({ title, items }: { title: string; items: MenuItem[] }) {
  // TODO: <nav className="menu"> の中に <h2>{title}</h2> と <ul>...</ul> を作る
  return createElement('nav', null, 'TODO');
}
