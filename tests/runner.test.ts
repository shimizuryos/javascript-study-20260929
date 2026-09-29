import { describe, expect, it } from 'vitest';
import { runTests } from '@/runner/run';

const run = (files: Record<string, string>, entry = 'test.ts') => runTests({ files, entry, timeoutMs: 3000 });

describe('runner', () => {
  it('runs plain TS tests', async () => {
    const r = await run({
      'main.ts': 'export const swap = <T,>([a, b]: [T, T]): [T, T] => [b, a];',
      'test.ts':
        "import { swap } from './main';\ntest('swap', () => { expect(swap([1, 2])).toEqual([2, 1]); });\ntest('fail', () => { expect(swap([1, 2])).toBe([2, 1]); });",
    });
    expect(r.status).toBe('failed');
    expect(r.tests.map((t) => t.status)).toEqual(['passed', 'failed']);
    expect(r.tests[1].error).toContain('toEqual');
  });

  it('reports compile errors with line numbers', async () => {
    const r = await run({ 'main.ts': 'const x = ;\n', 'test.ts': "import './main'; test('x', () => {});" });
    expect(r.status).toBe('error');
    expect(r.error?.phase).toBe('compile');
    expect(r.error?.line).toBe(1);
  });

  it('stops infinite loops', async () => {
    const r = await run({
      'main.ts': 'export function spin() { let i = 0; while (true) { i++; } }',
      'test.ts': "import { spin } from './main';\ntest('spin', () => { spin(); });",
    });
    expect(r.tests[0].status).toBe('failed');
    expect(r.tests[0].error).toContain('無限ループ');
  });

  it('reports runtime error location', async () => {
    const r = await run({
      'main.ts': 'export function f(u?: { name: string }) {\n  return u.name;\n}',
      'test.ts': "import { f } from './main';\ntest('f', () => { f(); });",
    });
    expect(r.tests[0].error).toMatch(/main\.ts 2行目/);
    expect(r.tests[0].error).toContain('ヒント');
  });

  it('renders React components and handles userEvent', async () => {
    const r = await run(
      {
        'main.tsx': `import { useState } from 'react';
export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN((c) => c + 1)}>count: {n}</button>;
}`,
        'test.tsx': `import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './main';
test('click', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toHaveTextContent('count: 1');
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toHaveTextContent('count: 2');
});
test('cleanup between tests', () => {
  expect(screen.queryByRole('button')).toBeNull();
});`,
      },
      'test.tsx',
    );
    expect(r.tests).toEqual([
      expect.objectContaining({ status: 'passed' }),
      expect.objectContaining({ status: 'passed' }),
    ]);
  });

  it('supports renderHook + act + useEffect', async () => {
    const r = await run({
      'main.ts': `import { useEffect, useState } from 'react';
export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const [changes, setChanges] = useState(0);
  useEffect(() => { setChanges((c) => c + 1); }, [on]);
  return { on, toggle: () => setOn((v) => !v), changes };
}`,
      'test.ts': `import { renderHook, act } from '@testing-library/react';
import { useToggle } from './main';
test('toggle', () => {
  const { result } = renderHook(() => useToggle());
  expect(result.current.on).toBe(false);
  act(() => result.current.toggle());
  expect(result.current.on).toBe(true);
  expect(result.current.changes).toBe(2);
});`,
    });
    expect(r.tests[0]).toMatchObject({ status: 'passed' });
  });

  it('supports nuqs testing adapter', async () => {
    const r = await run(
      {
        'main.tsx': `import { useQueryState, parseAsInteger } from 'nuqs';
export function Pager() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  return <button onClick={() => setPage(page + 1)}>page {page}</button>;
}`,
        'test.tsx': `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing';
import { Pager } from './main';
test('page', async () => {
  const onUrlUpdate = vi.fn();
  render(<NuqsTestingAdapter searchParams="?page=3" onUrlUpdate={onUrlUpdate}><Pager /></NuqsTestingAdapter>);
  expect(screen.getByRole('button')).toHaveTextContent('page 3');
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toHaveTextContent('page 4');
  await vi_wait();
  expect(onUrlUpdate).toHaveBeenCalled();
  const ev = onUrlUpdate.mock.calls[0][0] as UrlUpdateEvent;
  expect(ev.queryString).toBe('?page=4');
});
async function vi_wait() { await new Promise((r) => setTimeout(r, 100)); }`,
      },
      'test.tsx',
    );
    expect(r.tests[0]).toMatchObject({ status: 'passed' });
  });

  it('supports TanStack Query with findBy', async () => {
    const r = await run(
      {
        'api.ts': `export const fetchUser = async (id: number) => { await new Promise((r) => setTimeout(r, 20)); return { id, name: 'User ' + id }; };`,
        'main.tsx': `import { useQuery } from '@tanstack/react-query';
import { fetchUser } from './api';
export function User({ id }: { id: number }) {
  const { data, isPending } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) });
  if (isPending) return <p>loading</p>;
  return <p>{data?.name}</p>;
}`,
        'test.tsx': `import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User } from './main';
test('user', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><User id={7} /></QueryClientProvider>);
  expect(screen.getByText('loading')).toBeInTheDocument();
  expect(await screen.findByText('User 7')).toBeInTheDocument();
});`,
      },
      'test.tsx',
    );
    expect(r.tests[0]).toMatchObject({ status: 'passed' });
  });

  it('supports next/navigation mock', async () => {
    const r = await run(
      {
        'main.tsx': `'use client';
import { useRouter, useSearchParams } from 'next/navigation';
export function Search() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get('q') ?? '';
  return <><p>q={q}</p><button onClick={() => router.push('/?q=react')}>go</button></>;
}`,
        'test.tsx': `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@study/next-mock';
import { Search } from './main';
test('search', async () => {
  mockRouter.setUrl('/?q=js');
  render(<Search />);
  expect(screen.getByText('q=js')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('q=react')).toBeInTheDocument();
  expect(mockRouter.url).toBe('/?q=react');
});`,
      },
      'test.tsx',
    );
    expect(r.tests[0]).toMatchObject({ status: 'passed' });
  });
});
