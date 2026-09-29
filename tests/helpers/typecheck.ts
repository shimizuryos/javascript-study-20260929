import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import type { TypeDiagnostic } from '@/runner/types';

const require = createRequire(import.meta.url);

/** ブラウザの ts-worker.js と同じ typecheck-core.js を Node で動かす */
export function createTypeChecker() {
  const ts = require('typescript');
  // package.json が "type": "module" なので require ではなく vm で評価する
  const context: { TypecheckCore?: { createChecker: unknown } } = {};
  vm.runInNewContext(fs.readFileSync(path.resolve('public/runner/typecheck-core.js'), 'utf8'), context);
  const core = context.TypecheckCore as { createChecker: (ts: unknown, libs: Record<string, string>) => unknown };
  const libDir = path.dirname(require.resolve('typescript/lib/lib.d.ts'));
  const libFiles: Record<string, string> = {};
  for (const f of fs.readdirSync(libDir)) {
    if (/^lib\..*\.d\.ts$/.test(f)) libFiles[f] = fs.readFileSync(path.join(libDir, f), 'utf8');
  }
  ts.setLocalizedDiagnosticMessages(
    JSON.parse(fs.readFileSync(path.join(libDir, 'ja/diagnosticMessages.generated.json'), 'utf8')),
  );
  const globals = fs.readFileSync(path.resolve('public/runner/test-globals.d.ts'), 'utf8');
  const check = core.createChecker(ts, libFiles) as (files: Record<string, string>) => TypeDiagnostic[];
  return (files: Record<string, string>) => check({ 'test-globals.d.ts': globals, ...files });
}
