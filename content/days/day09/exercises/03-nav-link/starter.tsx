'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  // TODO: usePathname() で今のパスを取り、href と同じなら aria-current="page" を付ける
  return <Link href={href}>{children}</Link>;
}
