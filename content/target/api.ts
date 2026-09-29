/** 一覧 API のレスポンスの形 (ページごとのデータ + 全件数) */
export type Paginated<T> = {
  items: T[];
  total: number;
};
