'use client';

/**
 * 親ページ側: サンドボックス iframe を管理し、コードを送って結果を受け取る。
 * 実行のたびに iframe を読み込み直すので、前回の実行の影響 (タイマーや描画) が残らない。
 */
import type { SandboxRequest, SandboxResponse } from './protocol';
import type { RunError, RunRequest, RunResult } from './types';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const SANDBOX_URL = `${BASE}/sandbox/index.html`;

const READY_TIMEOUT = 30_000;
const RUN_TIMEOUT = 20_000;

export type SandboxRun = { result: RunResult; previewError: RunError | null };

function sandboxError(message: string): SandboxRun {
  return {
    result: { status: 'error', tests: [], logs: [], error: { phase: 'sandbox', message }, durationMs: 0 },
    previewError: null,
  };
}

export class SandboxController {
  private seq = 0;
  private readyResolve: (() => void) | null = null;
  private pending = new Map<number, (run: SandboxRun) => void>();
  private onResize: (height: number) => void;

  constructor(
    private iframe: HTMLIFrameElement,
    onResize: (height: number) => void,
  ) {
    this.onResize = onResize;
    window.addEventListener('message', this.handleMessage);
  }

  dispose() {
    window.removeEventListener('message', this.handleMessage);
  }

  private handleMessage = (event: MessageEvent<SandboxResponse>) => {
    if (event.origin !== window.location.origin || event.source !== this.iframe.contentWindow) return;
    const msg = event.data;
    if (msg?.type === 'ready') {
      this.readyResolve?.();
      this.readyResolve = null;
    } else if (msg?.type === 'result') {
      this.pending.get(msg.id)?.({ result: msg.result, previewError: msg.previewError });
      this.pending.delete(msg.id);
    } else if (msg?.type === 'resize') {
      this.onResize(msg.height);
    }
  };

  private reload(): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), READY_TIMEOUT);
      this.readyResolve = () => {
        clearTimeout(timer);
        resolve(true);
      };
      this.iframe.src = `${SANDBOX_URL}?run=${Date.now()}`;
    });
  }

  async run(request: RunRequest): Promise<SandboxRun> {
    const id = ++this.seq;
    const ready = await this.reload();
    if (!ready) return sandboxError('実行環境の読み込みに失敗しました。通信状況を確認して、もう一度実行してください。');
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.iframe.src = 'about:blank';
        resolve(
          sandboxError(
            `実行が ${RUN_TIMEOUT / 1000} 秒以内に終わりませんでした。無限ループや、終わらない非同期処理がないか確認してください。`,
          ),
        );
      }, RUN_TIMEOUT);
      this.pending.set(id, (run) => {
        clearTimeout(timer);
        resolve(run);
      });
      const message: SandboxRequest = { type: 'run', id, request };
      this.iframe.contentWindow?.postMessage(message, window.location.origin);
    });
  }
}
