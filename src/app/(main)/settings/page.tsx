import type { Metadata } from 'next';
import { SettingsPanel } from '@/components/settings/settings-panel';

export const metadata: Metadata = { title: '設定' };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">設定</h1>
      <SettingsPanel />
    </div>
  );
}
