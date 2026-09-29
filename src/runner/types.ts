/** ブラウザ内ランナーと UI の間でやりとりするデータの型 */

export type RunRequest = {
  /** ファイル名 → ソースコード (例: { 'main.ts': '...', 'test.ts': '...' }) */
  files: Record<string, string>;
  /** テストファイル名 (例: 'test.ts') */
  entry: string;
  /** プレビューとして描画するファイル (default export のコンポーネント) */
  preview?: string;
  /** テスト 1 件あたりのタイムアウト (ms) */
  timeoutMs?: number;
};

export type TestOutcome = {
  name: string;
  status: 'passed' | 'failed';
  error?: string;
  durationMs: number;
};

export type LogEntry = {
  level: 'log' | 'info' | 'warn' | 'error';
  text: string;
};

export type RunError = {
  phase: 'compile' | 'load' | 'sandbox';
  file?: string;
  line?: number;
  column?: number;
  message: string;
};

export type RunResult = {
  status: 'passed' | 'failed' | 'error';
  tests: TestOutcome[];
  logs: LogEntry[];
  error?: RunError;
  durationMs: number;
};

export type TypeDiagnostic = {
  file?: string;
  line?: number;
  column?: number;
  code: number;
  message: string;
};
