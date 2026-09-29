import { isScope, parseScope, type Scope } from './main';

type cases = [Expect<Equal<ReturnType<typeof parseScope>, Scope>>];

// isScope で絞り込めること (型チェック用。呼ばない)
function narrowCheck(value: string) {
  if (isScope(value)) {
    const scope: Scope = value;
    return scope;
  }
  // @ts-expect-error — ここでは value はただの string
  const notScope: Scope = value;
  return notScope;
}

test('isScope: 正しい値だけ true', () => {
  expect(isScope('all')).toBe(true);
  expect(isScope('team')).toBe(true);
  expect(isScope('org')).toBe(false);
  expect(isScope(null)).toBe(false);
  expect(isScope(1)).toBe(false);
});

test('parseScope: 正しい値はそのまま', () => {
  expect(parseScope('mine')).toBe('mine');
  expect(parseScope('team')).toBe('team');
});

test("parseScope: null や知らない値は 'all'", () => {
  expect(parseScope(null)).toBe('all');
  expect(parseScope('org')).toBe('all');
  expect(parseScope('')).toBe('all');
  expect(narrowCheck).toBeTypeOf('function');
});
