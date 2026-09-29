/**
 * 演習のテストを実行する中核部分。ブラウザ (サンドボックス iframe) と CI (Vitest + jsdom) の
 * 両方からこの関数を呼ぶので、「CI で模範解答が通る = ブラウザでも通る」ことが保証される。
 */
import { Component, createElement, type ComponentType, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { configure as configureDom, prettyDOM } from '@testing-library/dom';
import { compile, CompileError } from './transform';
import { AssertionError, expect, fn } from './expect';
import { format } from './format';
import { availableModuleNames, libraryModules, setUpdateGuard } from './modules';
import { cleanup } from '@testing-library/react';
import { mockRouter } from './next-mock';
import type { LogEntry, RunError, RunRequest, RunResult, TestOutcome } from './types';

const DEFAULT_TIMEOUT = 5000;
const EXTENSIONS = ['', '.ts', '.tsx', '.js', '.jsx'];

configureDom({
  getElementError(message, container) {
    const dump = container ? prettyDOM(container, 2000, { highlight: false }) : '';
    const error = new Error(`${translateDomMessage(message ?? '')}${dump ? `\n\n現在の画面:\n${dump}` : ''}`);
    error.name = 'TestingLibraryElementError';
    return error;
  },
});

function translateDomMessage(message: string) {
  return message
    .replace(
      /^Unable to find an element with the text: (.*?)\. This could be because.*$/s,
      'テキスト「$1」を持つ要素が見つかりませんでした。',
    )
    .replace(
      /^Unable to find an accessible element with the role "(.*?)"(?: and name "?(.*?)"?)?\s*$/m,
      (_, role, name) => `role="${role}"${name ? ` / 名前「${name}」` : ''} の要素が見つかりませんでした。`,
    )
    .replace(/^Unable to find a label with the text of: (.*)$/m, 'ラベル「$1」が見つかりませんでした。')
    .replace(
      /^Unable to find an element by: \[data-testid="(.*?)"\]$/m,
      'data-testid="$1" の要素が見つかりませんでした。',
    )
    .replace(
      /^Found multiple elements with the text: (.*)$/m,
      'テキスト「$1」を持つ要素が複数見つかりました。getAllByText を使うか、条件を絞ってください。',
    )
    .replace(
      /^Found multiple elements with the role "(.*?)".*$/m,
      'role="$1" の要素が複数見つかりました。name オプションで絞り込んでください。',
    );
}

type Hook = () => unknown;
type TestCase = { name: string; fn: () => unknown; timeout?: number; before: Hook[]; after: Hook[] };

const MAX_UPDATES_PER_TEST = 5000;

function createGuard() {
  let deadline = Number.POSITIVE_INFINITY;
  let count = 0;
  let updates = 0;
  return {
    reset(ms: number) {
      deadline = Date.now() + ms;
      count = 0;
      updates = 0;
    },
    /** state の更新 (setState / dispatch) のたびに呼ばれる */
    checkUpdate() {
      updates++;
      if (updates > MAX_UPDATES_PER_TEST || ((updates & 63) === 0 && Date.now() > deadline)) {
        throw new Error(
          'state の更新が止まりません: 無限に再レンダーしている可能性があります。useEffect の中で毎回 state を更新していないか、依存配列にレンダーのたびに新しく作られるオブジェクトや配列が入っていないかを確認してください。',
        );
      }
    },
    check() {
      if ((++count & 1023) === 0 && Date.now() > deadline) {
        throw new Error(
          '無限ループの可能性があります: ループが制限時間を過ぎても終わりませんでした。ループの終了条件を確認してください。',
        );
      }
    },
  };
}

function makeConsole(logs: LogEntry[]) {
  const toText = (args: unknown[]) => args.map((a) => (typeof a === 'string' ? a : format(a))).join(' ');
  const push =
    (level: LogEntry['level']) =>
    (...args: unknown[]) => {
      if (logs.length < 200) logs.push({ level, text: toText(args) });
    };
  return {
    log: push('log'),
    info: push('info'),
    debug: push('log'),
    warn: push('warn'),
    error: push('error'),
    table: push('log'),
  };
}

/**
 * React の開発ビルドが出す警告 (key が無い、など) も学習者に見せたいので、
 * 実行中だけ console.error / console.warn を横取りしてログに残す。
 */
function captureGlobalConsole(logs: LogEntry[]) {
  const original = { error: console.error, warn: console.warn };
  const capture =
    (level: 'error' | 'warn') =>
    (...args: unknown[]) => {
      const [first, ...rest] = args;
      // React の警告は printf 形式 ("%s") なので展開する
      const text =
        typeof first === 'string'
          ? first.replace(/%[sdo]/g, () => {
              const v = rest.shift();
              return typeof v === 'string' ? v : format(v);
            }) + (rest.length ? ` ${rest.map((r) => (typeof r === 'string' ? r : format(r))).join(' ')}` : '')
          : args.map((a) => format(a)).join(' ');
      if (logs.length < 200) logs.push({ level, text: text.split('\n').slice(0, 6).join('\n') });
    };
  console.error = capture('error');
  console.warn = capture('warn');
  return () => {
    console.error = original.error;
    console.warn = original.warn;
  };
}

const HINTS: [RegExp, string][] = [
  [
    /Cannot read propert(y|ies) of (undefined|null)/,
    'undefined / null の値からプロパティを読もうとしています。?. (オプショナルチェーン) や、値が入っているかの確認が必要かもしれません。',
  ],
  [/is not a function/, '関数ではない値を呼び出しています。import 名や、export し忘れを確認してください。'],
  [/is not defined/, '定義されていない変数を使っています。スペルや import を確認してください。'],
  [/is not iterable/, '配列ではない値を分割代入やスプレッドしようとしています。'],
  [
    /Assignment to constant variable/,
    'const で宣言した変数に再代入しています。let を使うか、新しい変数を作りましょう。',
  ],
  [
    /Rendered (more|fewer) hooks than/,
    'フックの呼び出し回数がレンダーごとに変わっています。if や for の中でフックを呼んでいませんか?',
  ],
  [/Invalid hook call/, 'フックはコンポーネント (または自作フック) の中のトップレベルでしか呼べません。'],
  [
    /Too many re-renders/,
    'レンダー中に setState を呼んで無限ループになっています。イベントハンドラや useEffect の中で呼びましょう。',
  ],
  [
    /Objects are not valid as a React child/,
    'オブジェクトをそのまま JSX に書いています。表示したいプロパティ (例: user.name) を指定してください。',
  ],
  [/No QueryClient set/, 'QueryClientProvider で囲まれていません。'],
  [/\[nuqs\].*adapter/i, 'nuqs のアダプター (NuqsAdapter / NuqsTestingAdapter) で囲まれていません。'],
];

function describeError(e: unknown, files: string[]): string {
  if (e instanceof AssertionError) return e.message;
  if (!(e instanceof Error)) return `例外が投げられました: ${format(e)}`;
  if (e.name === 'TestingLibraryElementError') return e.message;
  const loc = locate(e, files);
  const hint = HINTS.find(([re]) => re.test(e.message))?.[1];
  return `${e.name}: ${e.message}${loc ? ` (${loc.file} ${loc.line}行目)` : ''}${hint ? `\n\nヒント: ${hint}` : ''}`;
}

function locate(e: unknown, files: string[]): { file: string; line: number; column: number } | undefined {
  const stack = e instanceof Error ? (e.stack ?? '') : '';
  for (const m of stack.matchAll(/([\w.-]+\.(?:tsx?|jsx?)):(\d+):(\d+)/g)) {
    if (files.includes(m[1])) return { file: m[1], line: Number(m[2]), column: Number(m[3]) };
  }
  return undefined;
}

function withTimeout(promise: Promise<unknown>, ms: number): Promise<unknown> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            `タイムアウト: ${ms / 1000} 秒以内に終わりませんでした。await のし忘れや、findBy / waitFor で待っている表示が出ていない可能性があります。`,
          ),
        ),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

type Globals = Record<string, unknown>;

/** ファイル群を CommonJS 風に読み込む小さなモジュールシステム */
function createModuleSystem(compiled: Record<string, string>, globals: Globals) {
  const cache = new Map<string, { exports: Record<string, unknown> }>();
  const names = Object.keys(globals);
  const values = Object.values(globals);

  const resolveLocal = (spec: string) => {
    const base = spec.replace(/^\.\//, '');
    return EXTENSIONS.map((ext) => base + ext).find((f) => compiled[f] !== undefined);
  };

  const load = (file: string): Record<string, unknown> => {
    const cached = cache.get(file);
    if (cached) return cached.exports;
    const mod = { exports: {} as Record<string, unknown> };
    cache.set(file, mod);
    // 間接 eval + sourceURL で、エラーのスタックに「main.ts:3:10」のようなファイル名と行番号が出る
    const factory = (0, eval)(
      `(function (require, module, exports, ${names.join(', ')}) {${compiled[file]}\n})\n//# sourceURL=${file}`,
    );
    factory(makeRequire(file), mod, mod.exports, ...values);
    return mod.exports;
  };

  const makeRequire = (from: string) => (spec: string) => {
    if (spec.startsWith('./')) {
      const file = resolveLocal(spec);
      if (!file) throw new Error(`ファイル '${spec}' が見つかりません (${from} から import しています)`);
      return load(file);
    }
    const lib = libraryModules[spec];
    if (lib) return lib;
    throw new Error(`'${spec}' はこの演習では import できません。使えるモジュール: ${availableModuleNames.join(', ')}`);
  };

  return { load };
}

function compileAll(files: Record<string, string>): Record<string, string> {
  const compiled: Record<string, string> = {};
  for (const [name, source] of Object.entries(files)) {
    if (/\.d\.ts$/.test(name)) continue;
    compiled[name] = compile(name, source);
  }
  return compiled;
}

function compileErrorResult(e: CompileError, logs: LogEntry[], started: number): RunResult {
  return {
    status: 'error',
    tests: [],
    logs,
    error: { phase: 'compile', file: e.file, line: e.line, column: e.column, message: e.message },
    durationMs: Date.now() - started,
  };
}

export async function runTests(req: RunRequest): Promise<RunResult> {
  const started = Date.now();
  const logs: LogEntry[] = [];
  const fileNames = Object.keys(req.files);
  const guard = createGuard();

  let compiled: Record<string, string>;
  try {
    compiled = compileAll(req.files);
  } catch (e) {
    if (e instanceof CompileError) return compileErrorResult(e, logs, started);
    throw e;
  }

  const tests: TestCase[] = [];
  const describeStack: string[] = [];
  const hookStack: { before: Hook[]; after: Hook[] }[] = [{ before: [], after: [] }];

  const registerTest = (name: string, testFn: () => unknown, timeout?: number) => {
    tests.push({
      name: [...describeStack, name].join(' › '),
      fn: testFn,
      timeout,
      before: hookStack.flatMap((h) => h.before),
      after: hookStack.flatMap((h) => h.after).reverse(),
    });
  };
  const test = Object.assign(registerTest, { skip: () => {}, todo: () => {}, only: registerTest });
  const describe = Object.assign(
    (name: string, body: () => void) => {
      describeStack.push(name);
      hookStack.push({ before: [], after: [] });
      try {
        body();
      } finally {
        describeStack.pop();
        hookStack.pop();
      }
    },
    { skip: () => {} },
  );

  const globals: Globals = {
    test,
    it: test,
    describe,
    expect,
    beforeEach: (h: Hook) => hookStack.at(-1)!.before.push(h),
    afterEach: (h: Hook) => hookStack.at(-1)!.after.push(h),
    vi: { fn },
    console: makeConsole(logs),
    __guard: guard.check,
  };

  const modules = createModuleSystem(compiled, globals);
  const restoreConsole = captureGlobalConsole(logs);
  setUpdateGuard(guard.checkUpdate);
  try {
    return await execute();
  } finally {
    restoreConsole();
  }

  async function execute(): Promise<RunResult> {
    mockRouter.reset();
    guard.reset(req.timeoutMs ?? DEFAULT_TIMEOUT);
    try {
      modules.load(req.entry);
    } catch (e) {
      const loc = locate(e, fileNames);
      const error: RunError = { phase: 'load', message: describeError(e, fileNames), ...loc };
      return { status: 'error', tests: [], logs, error, durationMs: Date.now() - started };
    }

    if (tests.length === 0) {
      return {
        status: 'error',
        tests: [],
        logs,
        error: { phase: 'load', message: 'テストが 1 件も見つかりませんでした。' },
        durationMs: Date.now() - started,
      };
    }

    const outcomes: TestOutcome[] = [];
    for (const t of tests) {
      const t0 = Date.now();
      const timeout = t.timeout ?? req.timeoutMs ?? DEFAULT_TIMEOUT;
      guard.reset(timeout);
      let error: string | undefined;
      try {
        for (const h of t.before) await withTimeout(Promise.resolve().then(h), timeout);
        await withTimeout(Promise.resolve().then(t.fn), timeout);
      } catch (e) {
        error = describeError(e, fileNames);
      }
      try {
        for (const h of t.after) await withTimeout(Promise.resolve().then(h), timeout);
      } catch (e) {
        error ??= describeError(e, fileNames);
      }
      cleanup();
      mockRouter.reset();
      outcomes.push({ name: t.name, status: error ? 'failed' : 'passed', error, durationMs: Date.now() - t0 });
    }

    return {
      status: outcomes.every((o) => o.status === 'passed') ? 'passed' : 'failed',
      tests: outcomes,
      logs,
      durationMs: Date.now() - started,
    };
  }
}

/** プレビューの描画中に起きたエラーを、画面の中に表示する */
class PreviewErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return createElement(
      'pre',
      { style: { color: '#c9302f', whiteSpace: 'pre-wrap', fontSize: 12 } },
      `プレビューの描画中にエラーが起きました:\n${this.state.error.name}: ${this.state.error.message}`,
    );
  }
}

/** プレビュー用ファイルの default export を container に描画する (ブラウザ専用) */
export function renderPreview(
  files: Record<string, string>,
  previewFile: string,
  container: HTMLElement,
): RunError | null {
  const logs: LogEntry[] = [];
  const guard = createGuard();
  guard.reset(DEFAULT_TIMEOUT);
  try {
    const compiled = compileAll(files);
    const modules = createModuleSystem(compiled, {
      console: makeConsole(logs),
      __guard: guard.check,
      test: () => {},
      it: () => {},
      describe: () => {},
      expect,
      beforeEach: () => {},
      afterEach: () => {},
      vi: { fn },
    });
    const Component = modules.load(previewFile).default as ComponentType | undefined;
    if (typeof Component !== 'function') {
      return { phase: 'load', message: `${previewFile} が default export でコンポーネントを返していません。` };
    }
    createRoot(container).render(createElement(PreviewErrorBoundary, null, createElement(Component)));
    return null;
  } catch (e) {
    if (e instanceof CompileError) return { phase: 'compile', file: e.file, line: e.line, message: e.message };
    return { phase: 'load', message: describeError(e, Object.keys(files)) };
  }
}
