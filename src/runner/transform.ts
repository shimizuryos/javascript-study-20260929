import { transform } from 'sucrase';
import { Parser, type Node } from 'acorn';
import { simple as walk } from 'acorn-walk';

export class CompileError extends Error {
  constructor(
    message: string,
    readonly file: string,
    readonly line?: number,
    readonly column?: number,
  ) {
    super(message);
    this.name = 'CompileError';
  }
}

/** TS/TSX を、ランナーで評価できる CommonJS 形式の JS に変換する */
export function compile(fileName: string, source: string): string {
  const isTsx = /\.(tsx|jsx)$/.test(fileName);
  let code: string;
  try {
    code = transform(source, {
      transforms: isTsx ? ['typescript', 'jsx', 'imports'] : ['typescript', 'imports'],
      jsxRuntime: 'automatic',
      production: true,
      filePath: fileName,
      disableESTransforms: true,
    }).code;
  } catch (e) {
    throw toCompileError(fileName, e);
  }
  return addLoopGuards(fileName, code);
}

function toCompileError(fileName: string, e: unknown): CompileError {
  const raw = e instanceof Error ? e.message : String(e);
  const m = /\((\d+):(\d+)\)/.exec(raw);
  const line = m ? Number(m[1]) : undefined;
  const column = m ? Number(m[2]) + 1 : undefined;
  const detail = raw.replace(/^Error transforming [^:]+:\s*/, '').replace(/\s*\(\d+:\d+\)\s*$/, '');
  const where = line ? `${fileName} ${line}行目` : fileName;
  return new CompileError(`構文エラー (${where}): ${detail}`, fileName, line, column);
}

type LoopNode = Node & { body: Node & { type: string } };

/**
 * while / for / do-while の本体の先頭に __guard() を差し込む。
 * __guard は一定時間を超えると例外を投げ、無限ループでタブが固まるのを防ぐ。
 * 改行を入れないので、行番号は元のコードと一致したまま。
 */
function addLoopGuards(fileName: string, code: string): string {
  let ast: Node;
  try {
    ast = Parser.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });
  } catch (e) {
    const err = e as { message: string; loc?: { line: number; column: number } };
    throw new CompileError(
      `構文エラー (${fileName}${err.loc ? ` ${err.loc.line}行目` : ''}): ${err.message}`,
      fileName,
      err.loc?.line,
      err.loc ? err.loc.column + 1 : undefined,
    );
  }
  const inserts: { pos: number; text: string }[] = [];
  const onLoop = (node: Node) => {
    const body = (node as LoopNode).body;
    if (body.type === 'BlockStatement') {
      inserts.push({ pos: body.start + 1, text: '__guard();' });
    } else {
      inserts.push({ pos: body.start, text: '{__guard();' });
      inserts.push({ pos: body.end, text: '}' });
    }
  };
  walk(ast, {
    ForStatement: onLoop,
    ForInStatement: onLoop,
    ForOfStatement: onLoop,
    WhileStatement: onLoop,
    DoWhileStatement: onLoop,
  });
  inserts.sort((a, b) => b.pos - a.pos);
  let out = code;
  for (const { pos, text } of inserts) out = out.slice(0, pos) + text + out.slice(pos);
  return out;
}
