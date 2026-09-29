/** テスト結果やログに表示するための、値の読みやすい文字列化 */

const MAX_DEPTH = 4;
const MAX_ITEMS = 30;

export function format(value: unknown, depth = 0, seen = new WeakSet<object>()): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  switch (typeof value) {
    case 'string':
      return depth === 0 ? JSON.stringify(value) : JSON.stringify(value);
    case 'number':
      return Object.is(value, -0) ? '-0' : String(value);
    case 'bigint':
      return `${value}n`;
    case 'boolean':
      return String(value);
    case 'symbol':
      return value.toString();
    case 'function':
      return value.name ? `[Function ${value.name}]` : '[Function]';
  }
  const obj = value as object;
  if (isAsymmetric(obj)) return obj.toString();
  if (seen.has(obj)) return '[Circular]';
  if (typeof Element !== 'undefined' && obj instanceof Element) {
    const html = obj.outerHTML;
    return html.length > 200 ? `${html.slice(0, 200)}…` : html;
  }
  if (typeof Node !== 'undefined' && obj instanceof Node) return `[${obj.nodeName}]`;
  if (obj instanceof Date) return `Date(${isNaN(obj.getTime()) ? 'Invalid' : obj.toISOString()})`;
  if (obj instanceof RegExp) return obj.toString();
  if (obj instanceof Error) return `[${obj.name}: ${obj.message}]`;
  if (obj instanceof Promise) return 'Promise {…}';
  if (depth >= MAX_DEPTH) return Array.isArray(obj) ? '[…]' : '{…}';
  seen.add(obj);
  try {
    if (Array.isArray(obj)) {
      const items = obj.slice(0, MAX_ITEMS).map((v) => format(v, depth + 1, seen));
      if (obj.length > MAX_ITEMS) items.push(`…他 ${obj.length - MAX_ITEMS} 件`);
      return wrap('[', items, ']');
    }
    if (obj instanceof Map) {
      const items = [...obj]
        .slice(0, MAX_ITEMS)
        .map(([k, v]) => `${format(k, depth + 1, seen)} => ${format(v, depth + 1, seen)}`);
      return `Map(${obj.size}) ${wrap('{', items, '}')}`;
    }
    if (obj instanceof Set) {
      const items = [...obj].slice(0, MAX_ITEMS).map((v) => format(v, depth + 1, seen));
      return `Set(${obj.size}) ${wrap('{', items, '}')}`;
    }
    if (typeof URLSearchParams !== 'undefined' && obj instanceof URLSearchParams) {
      return `URLSearchParams(${JSON.stringify(obj.toString())})`;
    }
    const proto = Object.getPrototypeOf(obj);
    const name = proto && proto !== Object.prototype && proto.constructor?.name ? `${proto.constructor.name} ` : '';
    const keys = Object.keys(obj);
    const items = keys
      .slice(0, MAX_ITEMS)
      .map((k) => `${formatKey(k)}: ${format((obj as Record<string, unknown>)[k], depth + 1, seen)}`);
    if (keys.length > MAX_ITEMS) items.push(`…他 ${keys.length - MAX_ITEMS} 件`);
    return name + wrap('{', items, '}');
  } finally {
    seen.delete(obj);
  }
}

function formatKey(k: string) {
  return /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
}

function wrap(open: string, items: string[], close: string) {
  if (items.length === 0) return open + close;
  const oneLine = `${open}${open === '{' ? ' ' : ''}${items.join(', ')}${close === '}' ? ' ' : ''}${close}`;
  if (oneLine.length <= 72 && !oneLine.includes('\n')) return oneLine;
  return `${open}\n${items.map((i) => `  ${i.replace(/\n/g, '\n  ')}`).join(',\n')}\n${close}`;
}

export type AsymmetricMatcher = {
  $$asymmetric: true;
  match(other: unknown): boolean;
  toString(): string;
};

export function isAsymmetric(v: unknown): v is AsymmetricMatcher {
  return typeof v === 'object' && v !== null && (v as { $$asymmetric?: boolean }).$$asymmetric === true;
}
