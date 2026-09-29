/** URL 上のクエリ名。画面の中で使う名前 (page / q) と URL の名前 (p / keyword) が違う */
export const PARAM_KEYS = { page: 'p', q: 'keyword' };

export function toUrlParams(page: number, q: string) {
  // TODO: 計算されたキーを使って { p: '2', keyword: 'react' } の形にする (キー名は PARAM_KEYS から取る)
  return { page: String(page), q };
}

export type Form = { name: string; email: string; role: string };

export function setField(form: Form, field: 'name' | 'email' | 'role', value: string): Form {
  // TODO: form をコピーして、field のキーだけ value にした新しいオブジェクトを返す
  return form;
}

export function compact(params: Record<string, string | null>) {
  // TODO: Object.entries → filter → Object.fromEntries で、null と '' の項目を取り除く
  return params;
}
