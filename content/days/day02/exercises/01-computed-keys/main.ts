/** URL 上のクエリ名。画面の中で使う名前 (page / q) と URL の名前 (p / keyword) が違う */
export const PARAM_KEYS = { page: 'p', q: 'keyword' };

export const toUrlParams = (page: number, q: string) => ({
  [PARAM_KEYS.page]: String(page),
  [PARAM_KEYS.q]: q,
});

export type Form = { name: string; email: string; role: string };

export const setField = (form: Form, field: 'name' | 'email' | 'role', value: string): Form => ({
  ...form,
  [field]: value,
});

export const compact = (params: Record<string, string | null>) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== null && value !== ''));
