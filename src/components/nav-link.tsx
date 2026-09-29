'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
        active ? 'bg-accent-soft font-semibold text-ink' : 'text-ink-2 hover:bg-muted hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}
