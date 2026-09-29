import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Scope = 'all' | 'mine' | 'team';

export const SCOPE_LABELS: Record<Scope, string> = { all: 'すべて', mine: '自分', team: 'チーム' };

type ScopeContextValue = { scope: Scope; setScope: (scope: Scope) => void };

const ScopeContext = createContext<ScopeContextValue | null>(null);

export function ScopeProvider({ initialScope = 'all', children }: { initialScope?: Scope; children: ReactNode }) {
  const [scope, setScope] = useState<Scope>(initialScope);
  const value = useMemo(() => ({ scope, setScope }), [scope]);
  return <ScopeContext value={value}>{children}</ScopeContext>;
}

export function useScope(): ScopeContextValue {
  const value = useContext(ScopeContext);
  if (value === null) {
    throw new Error('useScope は <ScopeProvider> の中で使ってください');
  }
  return value;
}

export function ScopeSwitcher() {
  const { scope, setScope } = useScope();
  return (
    <div>
      {(Object.keys(SCOPE_LABELS) as Scope[]).map((s) => (
        <button key={s} aria-pressed={scope === s} onClick={() => setScope(s)}>
          {SCOPE_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

export function ScopeLabel() {
  const { scope } = useScope();
  return <p>表示中: {SCOPE_LABELS[scope]}</p>;
}
