'use client';

import { useSyncExternalStore } from 'react';
import { todayKey } from './dates';

/** 静的生成 (サーバー) とハイドレーション時は固定値、その後ブラウザの「今日」に切り替わる */
const SERVER_TODAY = '2000-01-03';

const subscribe = () => () => {};

/**
 * レンダー中に new Date() を読むと、ビルド時とブラウザで結果が変わって hydration エラーになる。
 * useSyncExternalStore の getServerSnapshot で「サーバーと同じ値」を返して防ぐ (Day 10)。
 */
export function useToday(): string {
  return useSyncExternalStore(subscribe, todayKey, () => SERVER_TODAY);
}
