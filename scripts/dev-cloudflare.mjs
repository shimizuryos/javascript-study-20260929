// Cloudflare Workers の環境をローカルで再現して起動する (E2E テストとローカル確認用)。
// 1. ローカルの D1 にマイグレーションを適用  2. wrangler dev で out/ + /api を配信
// DEV_LOGIN=1 で、GitHub を使わない「開発用ログイン」(/api/auth/dev-login) を有効にする。
import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = process.env.PORT ?? '8787';
const STATE = process.env.WRANGLER_STATE ?? '.wrangler/e2e-state';
const env = { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false' };

if (process.env.FRESH !== '0') fs.rmSync(STATE, { recursive: true, force: true });

const migrate = spawnSync(
  'npx',
  ['wrangler', 'd1', 'migrations', 'apply', 'js-study', '--local', '--persist-to', STATE],
  {
    stdio: 'inherit',
    env,
  },
);
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

const dev = spawn(
  'npx',
  [
    'wrangler',
    'dev',
    '--port',
    PORT,
    '--persist-to',
    STATE,
    '--var',
    'DEV_LOGIN:1',
    '--show-interactive-dev-session=false',
  ],
  { stdio: 'inherit', env },
);
const stop = () => dev.kill('SIGTERM');
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
dev.on('exit', (code) => process.exit(code ?? 0));
