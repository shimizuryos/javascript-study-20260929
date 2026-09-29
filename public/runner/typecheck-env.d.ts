/* ブラウザ内の型チェック演習だけで読み込む、最小限の実行環境の型 (標準ライブラリ ES2022 には含まれないもの) */

declare const console: {
  log(...data: unknown[]): void;
  info(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  error(...data: unknown[]): void;
};

declare function setTimeout(handler: (...args: unknown[]) => void, timeout?: number, ...args: unknown[]): number;
declare function clearTimeout(id: number | undefined): void;
