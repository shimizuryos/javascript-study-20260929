/**
 * サンドボックス iframe (public/sandbox/index.html) の中で動くスクリプト。
 * scripts/build-sandbox.mjs が React の「開発ビルド」と一緒に 1 ファイルへまとめる。
 * 親ページから届いたコードを実行し、結果を postMessage で返す。
 */
import { cleanup } from '@testing-library/react';
import { renderPreview, runTests } from '../runner/run';
import type { SandboxRequest, SandboxResponse } from '../runner/protocol';

const post = (msg: SandboxResponse) => window.parent.postMessage(msg, window.location.origin);

window.addEventListener('message', async (event: MessageEvent<SandboxRequest>) => {
  if (event.origin !== window.location.origin || event.data?.type !== 'run') return;
  const { id, request } = event.data;
  const result = await runTests(request);
  let previewError = null;
  if (request.preview && result.status !== 'error') {
    cleanup();
    const container = document.getElementById('preview')!;
    previewError = renderPreview(request.files, request.preview, container);
  }
  post({ type: 'result', id, result, previewError });
});

// 素の <a href> をクリックしても iframe 自体がページ遷移しないようにする
document.addEventListener('click', (event) => {
  const anchor = (event.target as Element | null)?.closest?.('a[href]');
  if (anchor) event.preventDefault();
});

new ResizeObserver(() => post({ type: 'resize', height: document.documentElement.scrollHeight })).observe(
  document.body,
);

post({ type: 'ready' });
