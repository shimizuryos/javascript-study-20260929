import { describe, expect, it } from 'vitest';
import { createTypeChecker } from './helpers/typecheck';

const check = createTypeChecker();

describe('typecheck core', () => {
  it('passes for correct types', () => {
    const d = check({
      'main.ts': "export const ROLES = ['admin', 'member'] as const;\nexport type Role = (typeof ROLES)[number];",
      'test.ts': "import type { Role } from './main';\ntype _ = Expect<Equal<Role, 'admin' | 'member'>>;",
    });
    expect(d).toEqual([]);
  });

  it('reports errors in Japanese with locations', () => {
    const d = check({
      'main.ts': "export const ROLES = ['admin', 'member'];\nexport type Role = (typeof ROLES)[number];",
      'test.ts': "import type { Role } from './main';\ntype _ = Expect<Equal<Role, 'admin' | 'member'>>;",
    });
    expect(d).toHaveLength(1);
    expect(d[0]).toMatchObject({ file: 'test.ts', line: 2 });
    expect(d[0].message).toMatch(/型/);
  });
});
