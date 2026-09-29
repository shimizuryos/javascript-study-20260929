// app/dashboard/layout.tsx に相当するファイル (Server Component。'use client' は書かない)
import type { ReactNode } from 'react';
import { NavLink } from './main'; // 実際のアプリでは './nav-link'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav aria-label="ダッシュボード">
        <NavLink href="/dashboard">概要</NavLink>
        <NavLink href="/dashboard/users">ユーザー</NavLink>
        <NavLink href="/dashboard/settings">設定</NavLink>
      </nav>
      {/* ここに page (または、さらに内側の layout) が入る */}
      <main>{children}</main>
    </div>
  );
}
