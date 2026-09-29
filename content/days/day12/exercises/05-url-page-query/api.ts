export type Article = { id: number; title: string };
export type ArticlesPage = { items: Article[]; total: number };

export const PAGE_SIZE = 3;
const ALL: Article[] = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, title: `記事 ${i + 1}` }));

/** 疑似 API: 少し待ってから、page ページ目 (1 始まり) の記事と全件数を返す */
export async function fetchArticles(page: number, signal?: AbortSignal): Promise<ArticlesPage> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  if (signal?.aborted) throw new Error('中断されました');
  const start = (page - 1) * PAGE_SIZE;
  return { items: ALL.slice(start, start + PAGE_SIZE), total: ALL.length };
}
