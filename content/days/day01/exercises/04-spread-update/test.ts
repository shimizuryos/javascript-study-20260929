import { addTag, nextQuery, type Query } from './main';

const base = (): Query => ({ page: 3, q: 'react', sort: 'new' });

test('検索語を変えると page が 1 に戻る', () => {
  expect(nextQuery(base(), { q: 'next' })).toEqual({ page: 1, q: 'next', sort: 'new' });
});

test('page を指定したときはその値になる', () => {
  expect(nextQuery(base(), { page: 4 })).toEqual({ page: 4, q: 'react', sort: 'new' });
});

test('元のオブジェクトは変更されない', () => {
  const query = base();
  const result = nextQuery(query, { sort: 'old' });
  expect(query).toEqual(base());
  expect(result).not.toBe(query);
});

test('addTag: 末尾に追加した新しい配列を返す', () => {
  const tags = ['js'];
  const result = addTag(tags, 'ts');
  expect(result).toEqual(['js', 'ts']);
  expect(tags).toEqual(['js']);
});

test('addTag: 重複は追加しない', () => {
  const tags = ['js', 'ts'];
  const result = addTag(tags, 'js');
  expect(result).toEqual(['js', 'ts']);
  expect(result).not.toBe(tags);
});
