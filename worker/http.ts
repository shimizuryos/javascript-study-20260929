export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(status: number, code: string, message?: string): Response {
  return json({ error: code, message }, { status });
}

export function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ location, 'cache-control': 'no-store' });
  for (const c of cookies) headers.append('set-cookie', c);
  return new Response(null, { status: 302, headers });
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

type CookieOptions = { maxAge?: number; path?: string; httpOnly?: boolean };

export function setCookie(
  name: string,
  value: string,
  { maxAge, path = '/', httpOnly = true }: CookieOptions = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, 'Secure', 'SameSite=Lax'];
  if (httpOnly) parts.push('HttpOnly');
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ');
}

export function clearCookie(name: string): string {
  return setCookie(name, '', { maxAge: 0 });
}

/**
 * 状態を変えるリクエスト (POST / PUT / DELETE) は、同じサイトのページから来たものだけ受け付ける (CSRF 対策)。
 * Cookie の SameSite=Lax と合わせて二重に守る。
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return origin !== null && origin === new URL(request.url).origin;
}

export function randomToken(bytes = 32): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** ログイン後に戻るパス。外部サイトへのリダイレクトに使われないよう、サイト内のパスだけ許す */
export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  return value;
}
