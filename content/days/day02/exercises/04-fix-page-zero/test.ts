import { pageLabel, resolvePagination } from './main';

test('pageIndex を指定するとそのページになる', () => {
  expect(resolvePagination({ pageIndex: 2 }, 5)).toEqual({ pageIndex: 2, pageSize: 20, offset: 40 });
});

test('pageIndex が無い (undefined / null) ときは前回のページを使う', () => {
  expect(resolvePagination({}, 5)).toEqual({ pageIndex: 5, pageSize: 20, offset: 100 });
  expect(resolvePagination({ pageIndex: null }, 5)).toEqual({ pageIndex: 5, pageSize: 20, offset: 100 });
});

test('pageIndex: 0 (1 ページ目) を指定すると 1 ページ目になる', () => {
  expect(resolvePagination({ pageIndex: 0 }, 5)).toEqual({ pageIndex: 0, pageSize: 20, offset: 0 });
});

test('pageSize を指定するとその件数で offset を計算する', () => {
  expect(resolvePagination({ pageIndex: 3, pageSize: 10 }, 0)).toEqual({ pageIndex: 3, pageSize: 10, offset: 30 });
});

test("pageLabel(0, 5) は '1 / 5 ページ'", () => {
  expect(pageLabel(0, 5)).toBe('1 / 5 ページ');
});
