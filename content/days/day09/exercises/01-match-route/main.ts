export type Params = Record<string, string | string[]>;

const toSegments = (path: string) => path.split('/').filter(Boolean);
const isGroup = (segment: string) => segment.startsWith('(') && segment.endsWith(')');

export function matchRoute(pattern: string, pathname: string): Params | null {
  const patternSegments = toSegments(pattern).filter((s) => !isGroup(s));
  const urlSegments = toSegments(pathname);
  const params: Params = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const segment = patternSegments[i];

    // [...slug]: 残り全部 (1 つ以上) を配列で受け取って終わり
    const catchAll = /^\[\.\.\.(.+)\]$/.exec(segment);
    if (catchAll) {
      const rest = urlSegments.slice(i);
      if (rest.length === 0) return null;
      params[catchAll[1]] = rest;
      return params;
    }

    const value = urlSegments[i];
    if (value === undefined) return null; // URL の方が短い

    // [id]: 1 セグメントを文字列で受け取る
    const dynamic = /^\[(.+)\]$/.exec(segment);
    if (dynamic) {
      params[dynamic[1]] = value;
    } else if (segment !== value) {
      return null; // 静的なセグメントが違う
    }
  }

  // URL の方が長い (/users/42/posts と /users/[id]) なら不一致
  return patternSegments.length === urlSegments.length ? params : null;
}
