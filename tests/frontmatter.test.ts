import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from '@/lib/frontmatter';

describe('parseFrontmatter', () => {
  it('frontmatter と本文を分ける (閉じの --- の直後の改行は本文に含めない)', () => {
    expect(parseFrontmatter('---\nday: 3\ntitle: 型\n---\n# 本文\n')).toEqual({
      data: { day: 3, title: '型' },
      content: '# 本文\n',
    });
  });

  it('CRLF の改行でも分けられる', () => {
    expect(parseFrontmatter('---\r\nday: 1\r\n---\r\nbody')).toEqual({ data: { day: 1 }, content: 'body' });
  });

  it('frontmatter が無ければ全体が本文', () => {
    expect(parseFrontmatter('# Title\n---\nx')).toEqual({ data: {}, content: '# Title\n---\nx' });
    expect(parseFrontmatter('----\nx')).toEqual({ data: {}, content: '----\nx' });
  });

  it('空の frontmatter は空のデータ', () => {
    expect(parseFrontmatter('---\n---\nbody')).toEqual({ data: {}, content: 'body' });
  });

  it('閉じの --- が無い・キーと値の形でない場合はエラー', () => {
    expect(() => parseFrontmatter('---\nday: 1\n# 本文')).toThrow('終わりの ---');
    expect(() => parseFrontmatter('---\n- a\n- b\n---\nx')).toThrow('キー: 値');
  });
});
