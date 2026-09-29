import { parseRange } from './main';

test("parseRange('3-7') は { from: 3, to: 7 }", () => {
  expect(parseRange('3-7')).toEqual({ from: 3, to: 7 });
});

test("parseRange('5') は { from: 5, to: 5 }", () => {
  expect(parseRange('5')).toEqual({ from: 5, to: 5 });
});

test('数値に変換されている', () => {
  expect(parseRange('10-12').from).toBeTypeOf('number');
});
