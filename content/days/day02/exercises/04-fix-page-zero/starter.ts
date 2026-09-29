/** pageIndex は TanStack Table と同じく 0 始まり (0 = 1 ページ目) */
export type PageInput = { pageIndex?: number | null; pageSize?: number | null };

export function resolvePagination(input: PageInput, lastPageIndex: number) {
  const pageIndex = input.pageIndex || lastPageIndex;
  const pageSize = input.pageSize ?? 20;
  return { pageIndex, pageSize, offset: pageIndex * pageSize };
}

/** 画面に出す「1 / 5 ページ」のような表示 */
export function pageLabel(pageIndex: number, pageCount: number) {
  return `${pageIndex + 1} / ${pageCount} ページ`;
}
