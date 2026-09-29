// 型チェック演習 (ブラウザ内 TypeScript) のために、TypeScript 本体と
// 標準ライブラリの型定義 (lib.*.d.ts) を public/vendor にコピーする。
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tsDir = path.dirname(require.resolve('typescript/package.json'));
const outDir = path.resolve('public/vendor/typescript');
const LIB_ENTRY = 'lib.es2022.d.ts';

fs.mkdirSync(path.join(outDir, 'lib'), { recursive: true });
fs.copyFileSync(path.join(tsDir, 'lib/typescript.js'), path.join(outDir, 'typescript.js'));
fs.copyFileSync(
  path.join(tsDir, 'lib/ja/diagnosticMessages.generated.json'),
  path.join(outDir, 'diagnosticMessages.ja.json'),
);

// lib.es2022.d.ts から /// <reference lib="..." /> をたどって必要なファイルだけ集める
const needed = new Set();
const visit = (file) => {
  if (needed.has(file)) return;
  needed.add(file);
  const text = fs.readFileSync(path.join(tsDir, 'lib', file), 'utf8');
  for (const m of text.matchAll(/\/\/\/\s*<reference lib="([^"]+)"\s*\/>/g)) {
    visit(`lib.${m[1].toLowerCase()}.d.ts`);
  }
};
visit(LIB_ENTRY);
for (const file of needed) {
  fs.copyFileSync(path.join(tsDir, 'lib', file), path.join(outDir, 'lib', file));
}
fs.writeFileSync(
  path.join(outDir, 'manifest.json'),
  JSON.stringify(
    { version: require('typescript/package.json').version, entry: LIB_ENTRY, libs: [...needed].sort() },
    null,
    2,
  ),
);
console.log(`copied TypeScript runtime + ${needed.size} lib files to ${path.relative(process.cwd(), outDir)}`);
