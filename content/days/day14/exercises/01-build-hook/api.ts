/** 一覧 API のレスポンスの形 (ページごとのデータ + 全件数) */
export type Paginated<T> = {
  items: T[];
  total: number;
};

export type Member = {
  id: number;
  name: string;
  team: 'フロント' | 'バック' | 'デザイン';
  addedByMe: boolean;
};

/** API の 1 ページの件数 (サーバー側で固定されている想定) */
export const PAGE_SIZE = 5;

const MEMBERS: Member[] = [
  { id: 1, name: '佐藤', team: 'フロント', addedByMe: true },
  { id: 2, name: '鈴木', team: 'バック', addedByMe: false },
  { id: 3, name: '高橋', team: 'フロント', addedByMe: false },
  { id: 4, name: '田中', team: 'デザイン', addedByMe: true },
  { id: 5, name: '伊藤', team: 'フロント', addedByMe: false },
  { id: 6, name: '渡辺', team: 'バック', addedByMe: false },
  { id: 7, name: '山本', team: 'フロント', addedByMe: true },
  { id: 8, name: '中村', team: 'デザイン', addedByMe: false },
  { id: 9, name: '小林', team: 'フロント', addedByMe: false },
  { id: 10, name: '加藤', team: 'バック', addedByMe: false },
  { id: 11, name: '吉田', team: 'フロント', addedByMe: false },
  { id: 12, name: '山田', team: 'バック', addedByMe: false },
];

/** 自分のチーム (scope=team のときに絞り込む) */
const MY_TEAM = 'フロント';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 疑似 API: GET /api/members?scope=...&page=...&q=...
 * - scope: all = 全員 / mine = 自分が追加したメンバー / team = 自分のチーム
 * - page: 1 始まり。1 ページ PAGE_SIZE 件
 * - q: 名前の部分一致 (null なら絞り込まない)
 */
export async function fetchMembers(
  params: { scope: 'all' | 'mine' | 'team'; page: number; q: string | null },
  signal?: AbortSignal,
): Promise<Paginated<Member>> {
  await wait(10);
  if (signal?.aborted) throw new Error('リクエストが中断されました');
  const { scope, page, q } = params;
  const filtered = MEMBERS.filter((m) => {
    if (scope === 'mine' && !m.addedByMe) return false;
    if (scope === 'team' && m.team !== MY_TEAM) return false;
    if (q && !m.name.includes(q)) return false;
    return true;
  });
  const start = (page - 1) * PAGE_SIZE;
  return { items: filtered.slice(start, start + PAGE_SIZE), total: filtered.length };
}
