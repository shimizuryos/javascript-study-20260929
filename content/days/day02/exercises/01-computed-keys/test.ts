import { PARAM_KEYS, compact, setField, toUrlParams, type Form } from './main';

test("toUrlParams(2, 'react') は { p: '2', keyword: 'react' }", () => {
  expect(toUrlParams(2, 'react')).toEqual({ p: '2', keyword: 'react' });
});

test('toUrlParams: キー名を PARAM_KEYS から取っている (p や keyword を直接書いていない)', () => {
  const saved = { ...PARAM_KEYS };
  // PARAM_KEYS を一時的に書き換えて、結果のキーも変わるかを見る
  PARAM_KEYS.page = 'pg';
  PARAM_KEYS.q = 'search';
  try {
    expect(toUrlParams(1, 'ts')).toEqual({ pg: '1', search: 'ts' });
  } finally {
    Object.assign(PARAM_KEYS, saved);
  }
});

test('setField: 指定したキーだけ書き換えた新しいオブジェクトを返す', () => {
  const form: Form = { name: 'Alice', email: '', role: 'member' };
  const next = setField(form, 'email', 'a@example.com');
  expect(next).toEqual({ name: 'Alice', email: 'a@example.com', role: 'member' });
  expect(next).not.toBe(form);
  expect(form.email).toBe('');
});

test('setField: どのキーでも使える', () => {
  const form: Form = { name: 'Alice', email: '', role: 'member' };
  expect(setField(form, 'role', 'admin')).toEqual({ name: 'Alice', email: '', role: 'admin' });
  expect(setField(form, 'name', 'Bob')).toEqual({ name: 'Bob', email: '', role: 'member' });
});

test('compact: null と空文字の項目を取り除く', () => {
  expect(compact({ scope: 'mine', q: null, sort: '', page: '2' })).toEqual({ scope: 'mine', page: '2' });
});

test('compact: 元のオブジェクトは変更しない', () => {
  const params = { scope: 'all', q: null };
  const result = compact(params);
  expect(result).toEqual({ scope: 'all' });
  expect(params).toEqual({ scope: 'all', q: null });
  expect(result).not.toBe(params);
});
