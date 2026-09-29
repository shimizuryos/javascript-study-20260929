export const swap = ([a, b]: [number, number]): [number, number] => [b, a];

export function headAndTail(items: string[]) {
  const [head, ...tail] = items;
  return { head, tail };
}

type Result = { data?: string[]; isPending: boolean };

export function describeResult(result: Result): string {
  const { data: rows = [], isPending } = result;
  if (isPending) return '読み込み中';
  return `${rows.length} 件`;
}
