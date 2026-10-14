/**
 * 進捗の保存と取得。
 * サーバーは進捗の中身を解釈せず、JSON をそのまま保存する (統合はクライアントが行う)。
 * version で「読んだ時点から誰かに書き換えられていないか」を確認する (楽観的ロック)。
 */
import type { Env } from './env';
import { error, json } from './http';

const MAX_BYTES = 512 * 1024;

type Row = { data: string; version: number; updated_at: number };

export async function getProgress(env: Env, userId: number): Promise<Response> {
  const row = await env.DB.prepare('SELECT data, version, updated_at FROM progress WHERE user_id = ?')
    .bind(userId)
    .first<Row>();
  if (!row) return json({ progress: null, version: 0, updatedAt: null });
  return json({ progress: JSON.parse(row.data), version: row.version, updatedAt: row.updated_at });
}

export async function putProgress(request: Request, env: Env, userId: number, now: number): Promise<Response> {
  const text = await request.text();
  if (text.length > MAX_BYTES) return error(413, 'too_large');
  let body: { progress?: { version?: unknown }; version?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return error(400, 'invalid_json');
  }
  const progress = body.progress;
  const baseVersion = body.version;
  if (!progress || typeof progress !== 'object' || progress.version !== 1) return error(400, 'invalid_progress');
  if (typeof baseVersion !== 'number' || !Number.isInteger(baseVersion) || baseVersion < 0) {
    return error(400, 'invalid_version');
  }

  const data = JSON.stringify(progress);
  const result =
    baseVersion === 0
      ? await env.DB.prepare(
          'INSERT INTO progress (user_id, data, version, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT (user_id) DO NOTHING',
        )
          .bind(userId, data, now)
          .run()
      : await env.DB.prepare(
          'UPDATE progress SET data = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND version = ?',
        )
          .bind(data, now, userId, baseVersion)
          .run();

  if (result.meta.changes === 0) {
    // 他の端末が先に書き込んでいた → 最新の内容を返し、クライアントに統合し直してもらう
    const current = await env.DB.prepare('SELECT data, version, updated_at FROM progress WHERE user_id = ?')
      .bind(userId)
      .first<Row>();
    return json(
      {
        error: 'conflict',
        progress: current ? JSON.parse(current.data) : null,
        version: current?.version ?? 0,
        updatedAt: current?.updated_at ?? null,
      },
      { status: 409 },
    );
  }
  return json({ version: baseVersion + 1, updatedAt: now });
}
