-- ユーザー (GitHub アカウントと 1 対 1)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER NOT NULL UNIQUE,
  login TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL
);

-- ログイン中のセッション。Cookie の値そのものではなく SHA-256 ハッシュだけを保存する
CREATE TABLE sessions (
  id_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user_id ON sessions(user_id);

-- 学習の進捗 (クライアントの Progress を JSON のまま保存)。version で同時更新を検出する
CREATE TABLE progress (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  version INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
