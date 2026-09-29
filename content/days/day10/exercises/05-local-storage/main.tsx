'use client';

import { useSyncExternalStore } from 'react';

export const THEME_KEY = 'study-day10-theme';

/** 別のタブで localStorage が変わったら知らせてもらう */
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

export function ThemeLabel() {
  const theme = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(THEME_KEY) ?? 'light', // ブラウザでの値
    () => 'light', // サーバーと hydration 中の値 (サーバーの HTML と一致させる)
  );
  return <p>テーマ: {theme}</p>;
}

// useEffect で書く場合:
//
// export function ThemeLabel() {
//   const [theme, setTheme] = useState('light');
//   useEffect(() => {
//     setTheme(localStorage.getItem(THEME_KEY) ?? 'light');
//   }, []);
//   return <p>テーマ: {theme}</p>;
// }
