export type Order = { id: number; customer: string };
export type OrdersPage = { items: Order[]; total: number };

const CUSTOMERS = ['佐藤', '鈴木', '高橋', '田中', '伊藤'];
const ALL: Order[] = Array.from({ length: 47 }, (_, i) => ({ id: i + 1, customer: CUSTOMERS[i % CUSTOMERS.length] }));

/**
 * 疑似 API (サーバー側でページ分けする)。page は 1 始まり。
 * 本当はサーバーとの通信 (Day 12 の useQuery) になるところを、ここでは同期的に返す。
 */
export function getOrdersPage(page: number, pageSize: number): OrdersPage {
  const start = (page - 1) * pageSize;
  return { items: ALL.slice(start, start + pageSize), total: ALL.length };
}
