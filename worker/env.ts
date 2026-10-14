export interface Env {
  /** out/ の静的ファイル */
  ASSETS: Fetcher;
  DB: D1Database;
  /** GitHub OAuth App の Client ID / Client secret (Cloudflare の secret として設定) */
  OAUTH_GITHUB_CLIENT_ID?: string;
  OAUTH_GITHUB_CLIENT_SECRET?: string;
  /** ログインを許可する GitHub アカウント (カンマ区切り)。空なら誰でも */
  ALLOWED_GITHUB_LOGINS?: string;
  /** '1' のとき、localhost からだけ /api/auth/dev-login が使える (ローカル開発と E2E テスト用) */
  DEV_LOGIN?: string;
}

/** テストで GitHub API への通信を差し替えられるようにする */
export type Deps = {
  fetch: typeof fetch;
  now: () => number;
};
