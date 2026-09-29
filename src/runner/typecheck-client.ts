'use client';

/** 親ページ側: 型チェック用 Web Worker (public/runner/ts-worker.js) とのやりとり */
import type { TypeDiagnostic } from './types';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, (r: { diagnostics?: TypeDiagnostic[]; error?: string }) => void>();

function getWorker() {
  if (!worker) {
    worker = new Worker(`${BASE}/runner/ts-worker.js`);
    worker.onmessage = (e: MessageEvent<{ id: number; diagnostics?: TypeDiagnostic[]; error?: string }>) => {
      pending.get(e.data.id)?.(e.data);
      pending.delete(e.data.id);
    };
  }
  return worker;
}

/** 初回だけ TypeScript 本体 (数 MB) を読み込むので時間がかかる */
export function typecheck(files: Record<string, string>): Promise<{ diagnostics?: TypeDiagnostic[]; error?: string }> {
  const id = ++seq;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    getWorker().postMessage({ id, files });
  });
}

/** 型チェック演習のページを開いた時点で、裏で読み込みを始めておく */
export function warmUpTypecheck() {
  void typecheck({ 'warmup.ts': 'export {};' });
}
