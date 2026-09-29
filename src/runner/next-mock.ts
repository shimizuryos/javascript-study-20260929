/**
 * ブラウザ内で Next.js のクライアント API (next/navigation, next/link) を試すためのモック。
 * 本物の Next.js はサーバーが必要なので、URL をメモリ上で管理する簡易版を用意している。
 * 演習コードは本物と同じ import 文 (`import { useRouter } from 'next/navigation'`) で書ける。
 */
import {
  createElement,
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';

type Listener = () => void;

const state = {
  url: new URL('http://localhost/'),
  history: ['/'] as string[],
};
const listeners = new Set<Listener>();
let snapshot = { pathname: '/', search: '', searchParams: new URLSearchParams() };

function emit() {
  snapshot = {
    pathname: state.url.pathname,
    search: state.url.search,
    searchParams: new URLSearchParams(state.url.search),
  };
  listeners.forEach((l) => l());
}

function navigate(href: string, mode: 'push' | 'replace') {
  const next = new URL(href, state.url);
  state.url = next;
  const path = next.pathname + next.search;
  if (mode === 'push') state.history.push(path);
  else state.history[state.history.length - 1] = path;
  emit();
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
const getSnapshot = () => snapshot;

/** テストから URL を操作・確認するためのオブジェクト */
export const mockRouter = {
  /** 現在の URL を設定する (例: mockRouter.setUrl('/users?page=2')) */
  setUrl(href: string) {
    state.url = new URL(href, 'http://localhost');
    state.history = [state.url.pathname + state.url.search];
    emit();
  },
  /** 現在のパス + クエリ (例: '/users?page=2') */
  get url() {
    return state.url.pathname + state.url.search;
  },
  get pathname() {
    return state.url.pathname;
  },
  get searchParams() {
    return new URLSearchParams(state.url.search);
  },
  /** push / replace の履歴 */
  get history() {
    return [...state.history];
  },
  reset() {
    this.setUrl('/');
  },
};

class ReadonlyURLSearchParams extends URLSearchParams {
  append(): never {
    throw new Error(
      'useSearchParams() が返す値は読み取り専用です。変更したいときは new URLSearchParams(searchParams) でコピーしてください。',
    );
  }
  set(): never {
    throw new Error(
      'useSearchParams() が返す値は読み取り専用です。変更したいときは new URLSearchParams(searchParams) でコピーしてください。',
    );
  }
  delete(): never {
    throw new Error(
      'useSearchParams() が返す値は読み取り専用です。変更したいときは new URLSearchParams(searchParams) でコピーしてください。',
    );
  }
}

export function useSearchParams(): URLSearchParams {
  const { search } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(() => new ReadonlyURLSearchParams(search), [search]);
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).pathname;
}

const router = {
  push: (href: string) => navigate(href, 'push'),
  replace: (href: string) => navigate(href, 'replace'),
  back: () => {
    if (state.history.length > 1) state.history.pop();
    state.url = new URL(state.history.at(-1) ?? '/', 'http://localhost');
    emit();
  },
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
};

export function useRouter() {
  return router;
}

export function redirect(href: string): never {
  navigate(href, 'replace');
  throw new Error(`NEXT_REDIRECT: ${href}`);
}

export function notFound(): never {
  throw new Error('NEXT_NOT_FOUND');
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | { pathname?: string; query?: Record<string, string | number> };
  replace?: boolean;
  prefetch?: boolean;
  scroll?: boolean;
  children?: ReactNode;
};

function hrefToString(href: LinkProps['href']) {
  if (typeof href === 'string') return href;
  const qs = href.query ? `?${new URLSearchParams(Object.entries(href.query).map(([k, v]) => [k, String(v)]))}` : '';
  return `${href.pathname ?? ''}${qs}`;
}

/** next/link の簡易版: クリックすると mockRouter の URL が変わる */
export function Link({ href, replace, onClick, ...props }: LinkProps) {
  // prefetch / scroll はモックでは使わないので a 要素に渡さない
  const { prefetch, scroll, ...rest } = props;
  void prefetch;
  void scroll;
  const target = hrefToString(href);
  return createElement('a', {
    ...rest,
    href: target,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      e.preventDefault();
      navigate(target, replace ? 'replace' : 'push');
    },
  });
}
