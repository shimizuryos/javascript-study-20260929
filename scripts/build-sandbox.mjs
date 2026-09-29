// サンドボックス iframe 用のスクリプトを esbuild で 1 ファイルにまとめる。
// React は「開発ビルド」を使う (act() が使え、key 警告なども出るため。Vitest/Jest と同じ挙動)。
import path from 'node:path';
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const options = {
  entryPoints: ['src/sandbox/main.ts'],
  outfile: 'public/vendor/sandbox/runner.js',
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  keepNames: true,
  legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"development"' },
  alias: { '@': path.resolve('src') },
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
