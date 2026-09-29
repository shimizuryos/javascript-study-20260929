import type { RunError, RunRequest, RunResult } from './types';

/** 親ページ → サンドボックス iframe */
export type SandboxRequest = { type: 'run'; id: number; request: RunRequest };

/** サンドボックス iframe → 親ページ */
export type SandboxResponse =
  | { type: 'ready' }
  | { type: 'result'; id: number; result: RunResult; previewError: RunError | null }
  | { type: 'resize'; height: number };
