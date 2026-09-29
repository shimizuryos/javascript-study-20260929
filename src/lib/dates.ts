/** 日付はすべて利用者のローカル時刻の YYYY-MM-DD 文字列で扱う */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const todayKey = () => toDateKey(new Date());

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function diffDays(from: string, to: string): number {
  return Math.round((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / 86_400_000);
}

/** 月曜始まりの週の最初の日 */
export function weekStart(key: string): string {
  const date = parseDateKey(key);
  const dow = (date.getDay() + 6) % 7;
  return addDays(key, -dow);
}

export function formatJa(key: string): string {
  const date = parseDateKey(key);
  const w = '日月火水木金土'[date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()} (${w})`;
}
