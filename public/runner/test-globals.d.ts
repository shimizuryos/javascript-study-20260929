/* 演習のテストコードで使えるグローバル関数と、型テスト用ヘルパーの型定義 */

declare function test(name: string, fn: () => unknown, timeout?: number): void;
declare const it: typeof test;
declare function describe(name: string, fn: () => void): void;
declare function beforeEach(fn: () => unknown): void;
declare function afterEach(fn: () => unknown): void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

interface MockFunction<F extends AnyFunction = AnyFunction> {
  (...args: Parameters<F>): ReturnType<F>;
  mock: { calls: Parameters<F>[]; results: { type: 'return' | 'throw'; value: unknown }[] };
  mockImplementation(fn: F): MockFunction<F>;
  mockImplementationOnce(fn: F): MockFunction<F>;
  mockReturnValue(value: ReturnType<F>): MockFunction<F>;
  mockReturnValueOnce(value: ReturnType<F>): MockFunction<F>;
  mockResolvedValue(value: Awaited<ReturnType<F>>): MockFunction<F>;
  mockRejectedValue(reason: unknown): MockFunction<F>;
  mockClear(): MockFunction<F>;
}

declare const vi: {
  fn<F extends AnyFunction = AnyFunction>(impl?: F): MockFunction<F>;
};

interface Assertion<R = void> {
  toBe(expected: unknown): R;
  toEqual(expected: unknown): R;
  toStrictEqual(expected: unknown): R;
  toMatchObject(expected: object): R;
  toBeNull(): R;
  toBeUndefined(): R;
  toBeDefined(): R;
  toBeTruthy(): R;
  toBeFalsy(): R;
  toBeNaN(): R;
  toBeTypeOf(type: 'string' | 'number' | 'boolean' | 'bigint' | 'symbol' | 'undefined' | 'object' | 'function'): R;
  toBeInstanceOf(ctor: abstract new (...args: never[]) => unknown): R;
  toBeGreaterThan(n: number): R;
  toBeGreaterThanOrEqual(n: number): R;
  toBeLessThan(n: number): R;
  toBeLessThanOrEqual(n: number): R;
  toBeCloseTo(n: number, digits?: number): R;
  toContain(item: unknown): R;
  toContainEqual(item: unknown): R;
  toHaveLength(n: number): R;
  toHaveProperty(path: string | string[], value?: unknown): R;
  toMatch(pattern: RegExp | string): R;
  toThrow(expected?: string | RegExp | (abstract new (...args: never[]) => Error)): R;
  toHaveBeenCalled(): R;
  toHaveBeenCalledTimes(n: number): R;
  toHaveBeenCalledWith(...args: unknown[]): R;
  toHaveBeenLastCalledWith(...args: unknown[]): R;
  toBeInTheDocument(): R;
  toHaveTextContent(text: string | RegExp): R;
  toHaveValue(value: unknown): R;
  toBeDisabled(): R;
  toBeEnabled(): R;
  toBeChecked(): R;
  toHaveAttribute(name: string, value?: string): R;
}

interface ExpectResult extends Assertion {
  not: Assertion;
  resolves: Assertion<Promise<void>> & { not: Assertion<Promise<void>> };
  rejects: Assertion<Promise<void>> & { not: Assertion<Promise<void>> };
}

interface ExpectStatic {
  (actual: unknown): ExpectResult;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any(ctor: unknown): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  anything(): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectContaining(obj: object): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arrayContaining(arr: unknown[]): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stringContaining(s: string): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stringMatching(r: RegExp | string): any;
}

declare const expect: ExpectStatic;

/* ---- 型テスト用 (type-challenges と同じ書き方) ----
 * type _t = Expect<Equal<typeof x, number>>
 * X と Y が完全に同じ型ならコンパイルが通り、違えば型エラーになる。
 */
type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;
