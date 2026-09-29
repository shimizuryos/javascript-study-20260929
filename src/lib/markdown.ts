import 'server-only';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';
import { codeToHtml } from 'shiki';

type HastNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HastNode[] };

/** 外部リンクを新しいタブで開く */
function rehypeExternalLinks() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href = String(node.properties?.href ?? '');
        if (/^https?:\/\//.test(href)) {
          node.properties = { ...node.properties, target: '_blank', rel: 'noopener noreferrer' };
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeShiki, {
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: 'light',
    fallbackLanguage: 'text',
    defaultLanguage: 'text',
  })
  .use(rehypeExternalLinks)
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  return String(await processor.process(markdown));
}

/** 1 行だけの Markdown (選択肢など) を <p> で包まずに返す */
export async function renderInlineMarkdown(markdown: string): Promise<string> {
  const html = await renderMarkdown(markdown);
  const m = /^<p>([\s\S]*)<\/p>\s*$/.exec(html.trim());
  return m ? m[1] : html;
}

/** 行ごとに data-line="1" のような属性を付けてハイライトする */
export async function highlightCode(code: string, lang: string): Promise<string> {
  return codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: 'light',
    transformers: [
      {
        line(node, line) {
          node.properties['data-line'] = line;
        },
      },
    ],
  });
}
