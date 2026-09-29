/**
 * Jest / Vitest 風の expect を、日本語のエラーメッセージ付きで実装したもの。
 * 学習者が読むのはテストの失敗メッセージなので、「何が違うのか」をできるだけ具体的に出す。
 */
import { format, isAsymmetric, type AsymmetricMatcher } from './format';

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

// ---------------------------------------------------------------------------
// 等価判定
// ---------------------------------------------------------------------------

type Difference = { path: string; expected: unknown; received: unknown; reason?: string };

/** 最初に見つかった違いを返す (等しければ null) */
export function findDifference(received: unknown, expected: unknown, strict: boolean, path = ''): Difference | null {
  if (isAsymmetric(expected)) {
    return expected.match(received) ? null : { path, expected, received };
  }
  if (Object.is(received, expected)) return null;
  if (typeof received !== 'object' || typeof expected !== 'object' || received === null || expected === null) {
    return { path, expected, received };
  }
  if (received instanceof Date && expected instanceof Date) {
    return received.getTime() === expected.getTime() ? null : { path, expected, received };
  }
  if (received instanceof RegExp && expected instanceof RegExp) {
    return String(received) === String(expected) ? null : { path, expected, received };
  }
  if (Array.isArray(received) !== Array.isArray(expected)) {
    return { path, expected, received, reason: Array.isArray(expected) ? '配列ではありません' : '配列になっています' };
  }
  if (strict && Object.getPrototypeOf(received) !== Object.getPrototypeOf(expected)) {
    return { path, expected, received, reason: '型 (クラス) が違います' };
  }
  if (received instanceof Map && expected instanceof Map) {
    if (received.size !== expected.size)
      return { path: `${path}.size`, expected: expected.size, received: received.size };
    for (const [k, v] of expected) {
      if (!received.has(k))
        return { path: `${path}.get(${format(k)})`, expected: v, received: undefined, reason: 'キーがありません' };
      const d = findDifference(received.get(k), v, strict, `${path}.get(${format(k)})`);
      if (d) return d;
    }
    return null;
  }
  if (received instanceof Set && expected instanceof Set) {
    if (received.size !== expected.size)
      return { path: `${path}.size`, expected: expected.size, received: received.size };
    for (const v of expected) {
      if (![...received].some((r) => findDifference(r, v, strict) === null)) {
        return { path, expected, received, reason: `${format(v)} が含まれていません` };
      }
    }
    return null;
  }
  if (Array.isArray(received) && Array.isArray(expected)) {
    const len = Math.max(received.length, expected.length);
    for (let i = 0; i < len; i++) {
      const d = findDifference(received[i], expected[i], strict, `${path}[${i}]`);
      if (d) return d;
    }
    if (received.length !== expected.length) {
      return { path: `${path}.length`, expected: expected.length, received: received.length };
    }
    return null;
  }
  const r = received as Record<string, unknown>;
  const e = expected as Record<string, unknown>;
  const keys = new Set([...Object.keys(e), ...Object.keys(r)]);
  for (const k of keys) {
    const childPath = path ? `${path}.${k}` : k;
    const inR = Object.prototype.hasOwnProperty.call(r, k);
    const inE = Object.prototype.hasOwnProperty.call(e, k);
    if (!strict) {
      // toEqual は undefined のプロパティを「無い」とみなす
      if (!inE && r[k] === undefined) continue;
      if (!inR && e[k] === undefined) continue;
    }
    if (inE && !inR) return { path: childPath, expected: e[k], received: undefined, reason: 'プロパティがありません' };
    if (inR && !inE)
      return { path: childPath, expected: undefined, received: r[k], reason: '余分なプロパティがあります' };
    const d = findDifference(r[k], e[k], strict, childPath);
    if (d) return d;
  }
  return null;
}

export function equals(a: unknown, b: unknown, strict = false) {
  return findDifference(a, b, strict) === null;
}

/** expected の各プロパティが received に含まれるか (toMatchObject 用) */
function matchesObject(received: unknown, expected: unknown): boolean {
  if (isAsymmetric(expected)) return expected.match(received);
  if (typeof expected !== 'object' || expected === null)
    return Object.is(received, expected) || equals(received, expected);
  if (typeof received !== 'object' || received === null) return false;
  if (Array.isArray(expected)) {
    return (
      Array.isArray(received) &&
      received.length === expected.length &&
      expected.every((v, i) => matchesObject(received[i], v))
    );
  }
  return Object.entries(expected).every(
    ([k, v]) => k in (received as object) && matchesObject((received as Record<string, unknown>)[k], v),
  );
}

// ---------------------------------------------------------------------------
// モック関数 (vi.fn)
// ---------------------------------------------------------------------------

export type MockFn = ((...args: unknown[]) => unknown) & {
  mock: { calls: unknown[][]; results: { type: 'return' | 'throw'; value: unknown }[] };
  mockImplementation(fn: (...args: unknown[]) => unknown): MockFn;
  mockImplementationOnce(fn: (...args: unknown[]) => unknown): MockFn;
  mockReturnValue(v: unknown): MockFn;
  mockReturnValueOnce(v: unknown): MockFn;
  mockResolvedValue(v: unknown): MockFn;
  mockRejectedValue(v: unknown): MockFn;
  mockClear(): MockFn;
  _isMockFunction: true;
};

export function fn(impl?: (...args: unknown[]) => unknown): MockFn {
  let implementation = impl;
  const once: ((...args: unknown[]) => unknown)[] = [];
  const mockFn = function (this: unknown, ...args: unknown[]) {
    mockFn.mock.calls.push(args);
    const f = once.shift() ?? implementation;
    try {
      const value = f ? f.apply(this, args) : undefined;
      mockFn.mock.results.push({ type: 'return', value });
      return value;
    } catch (e) {
      mockFn.mock.results.push({ type: 'throw', value: e });
      throw e;
    }
  } as MockFn;
  mockFn.mock = { calls: [], results: [] };
  mockFn._isMockFunction = true;
  mockFn.mockImplementation = (f) => ((implementation = f), mockFn);
  mockFn.mockImplementationOnce = (f) => (once.push(f), mockFn);
  mockFn.mockReturnValue = (v) => ((implementation = () => v), mockFn);
  mockFn.mockReturnValueOnce = (v) => (once.push(() => v), mockFn);
  mockFn.mockResolvedValue = (v) => ((implementation = () => Promise.resolve(v)), mockFn);
  mockFn.mockRejectedValue = (v) => ((implementation = () => Promise.reject(v)), mockFn);
  mockFn.mockClear = () => ((mockFn.mock.calls = []), (mockFn.mock.results = []), mockFn);
  return mockFn;
}

function isMock(v: unknown): v is MockFn {
  return typeof v === 'function' && (v as Partial<MockFn>)._isMockFunction === true;
}

// ---------------------------------------------------------------------------
// マッチャー
// ---------------------------------------------------------------------------

type MatcherResult = { pass: boolean; message: () => string };
type Ctx = { not: boolean };

const show = (label: string, v: unknown) =>
  `${label}: ${format(v).replace(/\n/g, '\n' + ' '.repeat(label.length + 2))}`;
const pair = (expected: unknown, received: unknown) => `${show('期待値  ', expected)}\n${show('実際の値', received)}`;

function describeDifference(d: Difference): string {
  const where = d.path ? `「${d.path}」` : '値';
  return `${where}が違います${d.reason ? ` (${d.reason})` : ''}\n${pair(d.expected, d.received)}`;
}

function isElement(v: unknown): v is Element {
  return typeof Element !== 'undefined' && v instanceof Element;
}

function assertElement(v: unknown, matcher: string): asserts v is Element {
  if (!isElement(v)) {
    throw new AssertionError(
      `${matcher} には DOM 要素を渡してください (例: screen.getByText(...))。\n${show('実際の値', v)}`,
    );
  }
}

function assertMock(v: unknown, matcher: string): asserts v is MockFn {
  if (!isMock(v)) {
    throw new AssertionError(`${matcher} にはモック関数 (vi.fn()) を渡してください。\n${show('実際の値', v)}`);
  }
}

const normalizeText = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

const matchers: Record<string, (this: Ctx, received: unknown, ...args: never[]) => MatcherResult> = {
  toBe(received, expected: unknown) {
    const pass = Object.is(received, expected);
    return {
      pass,
      message: () => {
        if (this.not) return `値が ${format(expected)} と同じにならないことを期待しましたが、同じでした。`;
        const hint =
          typeof expected === 'object' && expected !== null && equals(received, expected)
            ? '\n\nヒント: 中身は同じですが「別のオブジェクト」です。中身を比べたいなら toEqual を使います。'
            : '';
        return `toBe (=== 相当の比較) で一致しませんでした。\n${pair(expected, received)}${hint}`;
      },
    };
  },
  toEqual(received, expected: unknown) {
    const d = findDifference(received, expected, false);
    return {
      pass: d === null,
      message: () =>
        this.not
          ? `中身が ${format(expected)} と等しくならないことを期待しましたが、等しくなりました。`
          : `toEqual (中身の比較) で一致しませんでした。\n${describeDifference(d!)}`,
    };
  },
  toStrictEqual(received, expected: unknown) {
    const d = findDifference(received, expected, true);
    return {
      pass: d === null,
      message: () =>
        this.not
          ? `${format(expected)} と厳密に等しくならないことを期待しましたが、等しくなりました。`
          : `toStrictEqual で一致しませんでした。\n${describeDifference(d!)}`,
    };
  },
  toMatchObject(received, expected: unknown) {
    return {
      pass: matchesObject(received, expected),
      message: () =>
        `${this.not ? '部分的にも一致しないこと' : '次のプロパティを含むこと'}を期待しました。\n${pair(expected, received)}`,
    };
  },
  toBeNull(received) {
    return {
      pass: received === null,
      message: () => `null ${this.not ? 'ではない' : 'である'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeUndefined(received) {
    return {
      pass: received === undefined,
      message: () => `undefined ${this.not ? 'ではない' : 'である'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeDefined(received) {
    return {
      pass: received !== undefined,
      message: () => `undefined ${this.not ? 'である' : 'ではない'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeTruthy(received) {
    return {
      pass: !!received,
      message: () =>
        `truthy (if で真になる値) ${this.not ? 'ではない' : 'である'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeFalsy(received) {
    return {
      pass: !received,
      message: () =>
        `falsy (false, 0, "", null, undefined, NaN) ${this.not ? 'ではない' : 'である'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeNaN(received) {
    return {
      pass: Number.isNaN(received),
      message: () => `NaN ${this.not ? 'ではない' : 'である'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeTypeOf(received, expected: string) {
    return {
      pass: typeof received === expected,
      message: () =>
        `typeof が "${expected}" ${this.not ? 'ではない' : 'である'}ことを期待しました。\n${show('実際の typeof', typeof received)}`,
    };
  },
  toBeInstanceOf(received, expected: new (...a: never[]) => unknown) {
    return {
      pass: received instanceof expected,
      message: () =>
        `${expected.name} のインスタンス${this.not ? 'ではない' : 'である'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeGreaterThan(received, n: number) {
    return {
      pass: (received as number) > n,
      message: () =>
        `${this.not ? '' : ''}${n} より大きい${this.not ? 'ことを期待しませんでした' : 'ことを期待しました'}。\n${show('実際の値', received)}`,
    };
  },
  toBeGreaterThanOrEqual(received, n: number) {
    return {
      pass: (received as number) >= n,
      message: () => `${n} 以上${this.not ? 'でない' : 'である'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeLessThan(received, n: number) {
    return {
      pass: (received as number) < n,
      message: () =>
        `${n} より小さい${this.not ? 'ことを期待しませんでした' : 'ことを期待しました'}。\n${show('実際の値', received)}`,
    };
  },
  toBeLessThanOrEqual(received, n: number) {
    return {
      pass: (received as number) <= n,
      message: () => `${n} 以下${this.not ? 'でない' : 'である'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toBeCloseTo(received, n: number, digits = 2) {
    const pass = Math.abs((received as number) - n) < 10 ** -digits / 2;
    return {
      pass,
      message: () =>
        `${n} に${this.not ? '近くない' : '近い'}ことを期待しました (小数 ${digits} 桁)。\n${show('実際の値', received)}`,
    };
  },
  toContain(received, item: unknown) {
    const pass =
      typeof received === 'string'
        ? received.includes(item as string)
        : Array.isArray(received) || received instanceof Set
          ? [...(received as Iterable<unknown>)].includes(item)
          : false;
    return {
      pass,
      message: () =>
        `${format(item)} を含ま${this.not ? 'ない' : 'れる'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toContainEqual(received, item: unknown) {
    const pass = Array.isArray(received) && received.some((r) => equals(r, item));
    return {
      pass,
      message: () =>
        `${format(item)} と等しい要素を含ま${this.not ? 'ない' : 'れる'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toHaveLength(received, n: number) {
    const len = (received as { length?: number } | null)?.length;
    return {
      pass: len === n,
      message: () =>
        `長さ (length) が ${n} ${this.not ? 'でない' : 'である'}ことを期待しました。\n${show('実際の length', len)}\n${show('実際の値', received)}`,
    };
  },
  toHaveProperty(received, path: string | string[], ...rest: unknown[]) {
    const keys = Array.isArray(path) ? path : path.split('.');
    let cur: unknown = received;
    let found = true;
    for (const k of keys) {
      if (cur !== null && cur !== undefined && k in Object(cur)) cur = (cur as Record<string, unknown>)[k];
      else {
        found = false;
        break;
      }
    }
    const pass = found && (rest.length === 0 || equals(cur, rest[0]));
    return {
      pass,
      message: () =>
        `プロパティ「${keys.join('.')}」${rest.length ? ` = ${format(rest[0])}` : ''} を持${this.not ? 'たない' : 'つ'}ことを期待しました。\n${found ? show('実際のプロパティ値', cur) : '(プロパティがありません)'}\n${show('対象', received)}`,
    };
  },
  toMatch(received, pattern: RegExp | string) {
    const pass =
      typeof received === 'string' &&
      (typeof pattern === 'string' ? received.includes(pattern) : pattern.test(received));
    return {
      pass,
      message: () =>
        `${String(pattern)} に${this.not ? 'マッチしない' : 'マッチする'}ことを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toThrow(received, expected?: string | RegExp | (new (...a: never[]) => Error)) {
    if (typeof received !== 'function') {
      throw new AssertionError(
        `toThrow には関数を渡します。例: expect(() => f()).toThrow()\n${show('実際の値', received)}`,
      );
    }
    let thrown: unknown;
    let didThrow = false;
    try {
      (received as () => unknown)();
    } catch (e) {
      didThrow = true;
      thrown = e;
    }
    const msg = thrown instanceof Error ? thrown.message : String(thrown);
    let pass = didThrow;
    if (didThrow && expected !== undefined) {
      if (typeof expected === 'string') pass = msg.includes(expected);
      else if (expected instanceof RegExp) pass = expected.test(msg);
      else pass = thrown instanceof expected;
    }
    return {
      pass,
      message: () =>
        this.not
          ? `例外が投げられないことを期待しましたが、投げられました。\n${show('例外', thrown)}`
          : didThrow
            ? `例外は投げられましたが、期待と違いました。\n${show('期待', expected)}\n${show('実際の例外', thrown)}`
            : '関数を呼んでも例外が投げられませんでした。',
    };
  },
  toHaveBeenCalled(received) {
    assertMock(received, 'toHaveBeenCalled');
    const n = received.mock.calls.length;
    return {
      pass: n > 0,
      message: () => `関数が呼ばれ${this.not ? 'ない' : 'る'}ことを期待しました。\n${show('呼ばれた回数', n)}`,
    };
  },
  toHaveBeenCalledTimes(received, times: number) {
    assertMock(received, 'toHaveBeenCalledTimes');
    const n = received.mock.calls.length;
    return {
      pass: n === times,
      message: () =>
        `関数が ${times} 回呼ばれ${this.not ? 'ない' : 'る'}ことを期待しました。\n${show('実際に呼ばれた回数', n)}`,
    };
  },
  toHaveBeenCalledWith(received, ...args: unknown[]) {
    assertMock(received, 'toHaveBeenCalledWith');
    const calls = received.mock.calls;
    return {
      pass: calls.some((c) => equals(c, args)),
      message: () =>
        `引数 ${format(args)} で呼ばれ${this.not ? 'ない' : 'る'}ことを期待しました。\n${show('実際の呼び出し', calls)}`,
    };
  },
  toHaveBeenLastCalledWith(received, ...args: unknown[]) {
    assertMock(received, 'toHaveBeenLastCalledWith');
    const last = received.mock.calls.at(-1);
    return {
      pass: last !== undefined && equals(last, args),
      message: () =>
        `最後の呼び出しの引数が ${format(args)} ${this.not ? 'でない' : 'である'}ことを期待しました。\n${show('最後の呼び出し', last)}`,
    };
  },
  // ---- DOM 用 (jest-dom 相当) ----
  toBeInTheDocument(received) {
    const pass = isElement(received) && received.ownerDocument.contains(received);
    return {
      pass,
      message: () =>
        this.not
          ? `要素が画面に無いことを期待しましたが、ありました。\n${show('要素', received)}`
          : `要素が画面にあることを期待しました。\n${show('実際の値', received)}`,
    };
  },
  toHaveTextContent(received, text: string | RegExp) {
    assertElement(received, 'toHaveTextContent');
    const content = normalizeText(received.textContent);
    const pass = typeof text === 'string' ? content.includes(normalizeText(text)) : text.test(content);
    return {
      pass,
      message: () =>
        `テキスト ${format(text)} を含ま${this.not ? 'ない' : 'れる'}ことを期待しました。\n${show('実際のテキスト', content)}`,
    };
  },
  toHaveValue(received, value: unknown) {
    assertElement(received, 'toHaveValue');
    const el = received as HTMLInputElement;
    const actual = el.type === 'number' ? (el.value === '' ? null : Number(el.value)) : el.value;
    return {
      pass: equals(actual, value),
      message: () =>
        `入力値が ${format(value)} ${this.not ? 'でない' : 'である'}ことを期待しました。\n${show('実際の入力値', actual)}`,
    };
  },
  toBeDisabled(received) {
    assertElement(received, 'toBeDisabled');
    const pass = (received as HTMLButtonElement).disabled === true || received.closest('fieldset[disabled]') !== null;
    return {
      pass,
      message: () =>
        `要素が無効 (disabled) ${this.not ? 'でない' : 'である'}ことを期待しました。\n${show('要素', received)}`,
    };
  },
  toBeEnabled(received) {
    assertElement(received, 'toBeEnabled');
    const pass = !(
      (received as HTMLButtonElement).disabled === true || received.closest('fieldset[disabled]') !== null
    );
    return {
      pass,
      message: () =>
        `要素が有効 (enabled) ${this.not ? 'でない' : 'である'}ことを期待しました。\n${show('要素', received)}`,
    };
  },
  toBeChecked(received) {
    assertElement(received, 'toBeChecked');
    const pass = (received as HTMLInputElement).checked === true || received.getAttribute('aria-checked') === 'true';
    return {
      pass,
      message: () => `チェックされて${this.not ? 'いない' : 'いる'}ことを期待しました。\n${show('要素', received)}`,
    };
  },
  toHaveAttribute(received, name: string, ...rest: unknown[]) {
    assertElement(received, 'toHaveAttribute');
    const has = received.hasAttribute(name);
    const actual = received.getAttribute(name);
    const pass = has && (rest.length === 0 || actual === rest[0]);
    return {
      pass,
      message: () =>
        `属性 ${name}${rest.length ? `="${String(rest[0])}"` : ''} を持${this.not ? 'たない' : 'つ'}ことを期待しました。\n${show('実際の属性値', actual)}`,
    };
  },
};

type Matchers = { [K in keyof typeof matchers]: (...args: never[]) => void };
type Expectation = Record<string, (...args: unknown[]) => unknown> & {
  not: Record<string, (...args: unknown[]) => unknown>;
  resolves: Record<string, (...args: unknown[]) => Promise<void>>;
  rejects: Record<string, (...args: unknown[]) => Promise<void>>;
};

function buildMatchers(received: unknown, not: boolean) {
  const out: Record<string, (...args: unknown[]) => void> = {};
  for (const [name, matcher] of Object.entries(matchers)) {
    out[name] = (...args: unknown[]) => {
      const result = (matcher as (this: Ctx, r: unknown, ...a: unknown[]) => MatcherResult).call(
        { not },
        received,
        ...args,
      );
      if (result.pass === not) {
        throw new AssertionError(`expect(…)${not ? '.not' : ''}.${name}(…)\n\n${result.message()}`);
      }
    };
  }
  return out;
}

function buildAsync(promise: unknown, mode: 'resolves' | 'rejects', not: boolean) {
  const out: Record<string, (...args: unknown[]) => Promise<void>> = {};
  for (const name of Object.keys(matchers)) {
    out[name] = async (...args: unknown[]) => {
      if (!(promise instanceof Promise) && !(promise && typeof (promise as Promise<unknown>).then === 'function')) {
        throw new AssertionError(`.${mode} には Promise を渡してください。\n${show('実際の値', promise)}`);
      }
      let value: unknown;
      try {
        value = await promise;
        if (mode === 'rejects')
          throw new AssertionError(
            `Promise が reject されることを期待しましたが、resolve されました。\n${show('resolve された値', value)}`,
          );
      } catch (e) {
        if (e instanceof AssertionError) throw e;
        if (mode === 'resolves')
          throw new AssertionError(
            `Promise が resolve されることを期待しましたが、reject されました。\n${show('reject 理由', e)}`,
          );
        value = e;
      }
      // expect(promise).rejects.toThrow('msg') は「reject された値を投げる関数」として検査する (Vitest と同じ)
      const subject =
        mode === 'rejects' && name === 'toThrow'
          ? () => {
              throw value;
            }
          : value;
      buildMatchers(subject, not)[name](...args);
    };
  }
  return out;
}

function asymmetric(match: (v: unknown) => boolean, name: string): AsymmetricMatcher {
  return { $$asymmetric: true, match, toString: () => name };
}

export type ExpectFn = ((received: unknown) => Expectation & Matchers) & {
  any(ctor: unknown): AsymmetricMatcher;
  anything(): AsymmetricMatcher;
  objectContaining(obj: object): AsymmetricMatcher;
  arrayContaining(arr: unknown[]): AsymmetricMatcher;
  stringContaining(s: string): AsymmetricMatcher;
  stringMatching(r: RegExp | string): AsymmetricMatcher;
};

export const expect = ((received: unknown) => {
  const e = buildMatchers(received, false) as unknown as Expectation;
  e.not = buildMatchers(received, true);
  e.resolves = buildAsync(received, 'resolves', false);
  e.rejects = buildAsync(received, 'rejects', false);
  Object.assign(e.resolves, { not: buildAsync(received, 'resolves', true) });
  Object.assign(e.rejects, { not: buildAsync(received, 'rejects', true) });
  return e;
}) as ExpectFn;

const primitiveCtor = new Map<unknown, string>([
  [String, 'string'],
  [Number, 'number'],
  [Boolean, 'boolean'],
  [BigInt, 'bigint'],
  [Symbol, 'symbol'],
  [Function, 'function'],
]);

expect.any = (ctor) =>
  asymmetric(
    (v) => {
      const t = primitiveCtor.get(ctor);
      if (t) return typeof v === t || (t !== 'function' && v instanceof (ctor as new () => unknown));
      return v instanceof (ctor as new () => unknown);
    },
    `Any<${(ctor as { name?: string }).name ?? '?'}>`,
  );
expect.anything = () => asymmetric((v) => v !== null && v !== undefined, 'Anything');
expect.objectContaining = (obj) => asymmetric((v) => matchesObject(v, obj), `ObjectContaining ${format(obj)}`);
expect.arrayContaining = (arr) =>
  asymmetric(
    (v) => Array.isArray(v) && arr.every((a) => v.some((x) => equals(x, a))),
    `ArrayContaining ${format(arr)}`,
  );
expect.stringContaining = (s) =>
  asymmetric((v) => typeof v === 'string' && v.includes(s), `StringContaining ${JSON.stringify(s)}`);
expect.stringMatching = (r) =>
  asymmetric(
    (v) => typeof v === 'string' && (typeof r === 'string' ? new RegExp(r) : r).test(v),
    `StringMatching ${String(r)}`,
  );
