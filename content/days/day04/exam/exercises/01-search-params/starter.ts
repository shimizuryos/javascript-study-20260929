export const PARAM_KEYS = { scope: 'scope', page: 'p', q: 'keyword' } as const;
export type Params = { scope: string; page: number; q: string | null };

export function toSearchObject(params: Params): Record<string, string> {
  // TODO: PARAM_KEYS をキーにしたオブジェクトを返す。q が null / '' なら keyword を含めない
  return {};
}

export function changeScope(params: Params, scope: string): Params {
  // TODO: scope を変えて page を 1 に戻した新しいオブジェクトを返す
  return params;
}

export function fromSearchObject(search: Record<string, string | undefined>): Params {
  // TODO: 無いときの値に注意して Params を作る
  return { scope: '', page: 0, q: null };
}
