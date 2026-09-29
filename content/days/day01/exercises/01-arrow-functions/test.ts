import { double, greet, toUser } from './main';

test('double(3) は 6', () => {
  expect(double(3)).toBe(6);
});

test("greet('Alice') は 'こんにちは、Aliceさん'", () => {
  expect(greet('Alice')).toBe('こんにちは、Aliceさん');
});

test("toUser('Bob') は { name: 'Bob', active: true }", () => {
  expect(toUser('Bob')).toEqual({ name: 'Bob', active: true });
});

test('3 つともアロー関数で書かれている', () => {
  // function で書いた関数には prototype があるが、アロー関数には無い
  expect(double.prototype).toBeUndefined();
  expect(greet.prototype).toBeUndefined();
  expect(toUser.prototype).toBeUndefined();
});
