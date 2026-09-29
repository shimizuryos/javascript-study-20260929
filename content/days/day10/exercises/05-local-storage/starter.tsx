'use client';

export const THEME_KEY = 'study-day10-theme';

export function ThemeLabel() {
  // TODO: レンダー中に localStorage を読んでいるので、サーバーの HTML と hydration の結果が食い違う
  const theme = typeof window === 'undefined' ? 'light' : (localStorage.getItem(THEME_KEY) ?? 'light');
  return <p>テーマ: {theme}</p>;
}
