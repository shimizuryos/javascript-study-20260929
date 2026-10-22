/**
 * Markdown の先頭にある YAML frontmatter (--- で囲んだ部分) と本文を分ける。
 * 以前使っていた gray-matter と同じ区切り方をする (閉じの --- の直後の改行 1 つは本文に含めない)。
 */
import yaml from 'js-yaml';

export type Frontmatter = { data: Record<string, unknown>; content: string };

const DELIMITER = '---';

export function parseFrontmatter(text: string): Frontmatter {
  // "----" のように続く場合は区切りではない
  if (!text.startsWith(DELIMITER) || text.charAt(DELIMITER.length) === '-') return { data: {}, content: text };

  const rest = text.slice(DELIMITER.length);
  const close = rest.indexOf('\n' + DELIMITER);
  if (close === -1) throw new Error('frontmatter の終わりの --- がありません');

  const data = yaml.load(rest.slice(0, close)) ?? {};
  if (typeof data !== 'object' || Array.isArray(data))
    throw new Error('frontmatter は「キー: 値」の形で書いてください');

  let content = rest.slice(close + 1 + DELIMITER.length);
  if (content.startsWith('\r')) content = content.slice(1);
  if (content.startsWith('\n')) content = content.slice(1);
  return { data: data as Record<string, unknown>, content };
}
