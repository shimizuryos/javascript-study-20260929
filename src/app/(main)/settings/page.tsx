import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { AccountCard } from '@/components/settings/account-card';

export const metadata: Metadata = { title: '設定' };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">設定</h1>
      {/* useSearchParams (?login=denied など) を使うので Suspense で囲む */}
      <Suspense fallback={null}>
        <AccountCard />
      </Suspense>
      <SettingsPanel />
    </div>
  );
}
