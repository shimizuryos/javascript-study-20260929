/**
 * content/ ディレクトリの教材を読み込む (ビルド時にサーバー側でだけ動く)。
 *
 * content/days/day01/
 *   lesson.md          … frontmatter (day, level, title, ...) + 本文
 *   quiz.md            … 確認クイズ
 *   exercises/01-xxx/  … README.md, starter.ts, main.ts (模範解答), test.ts, 補助ファイル
 *   exam/              … exam.md, quiz.md, exercises/ (試験がある日だけ)
 */
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { highlightCode, renderInlineMarkdown, renderMarkdown } from './markdown';
import type {
  Day,
  DayMeta,
  Exam,
  Exercise,
  ExerciseFile,
  ExerciseSummary,
  Level,
  QuizQuestion,
  Reading,
  TargetCode,
  TargetSegment,
} from '@/content/types';

export const CONTENT_DIR = process.env.STUDY_CONTENT_DIR ?? path.join(process.cwd(), 'content');
const DAYS_DIR = path.join(CONTENT_DIR, 'days');

const read = (p: string) => fs.readFileSync(p, 'utf8');
const exists = (p: string) => fs.existsSync(p);
const dayDirName = (day: number) => `day${String(day).padStart(2, '0')}`;

// ---------------------------------------------------------------------------
// クイズ (quiz.md) のパース
// ---------------------------------------------------------------------------

export type RawQuizQuestion = {
  id: string;
  prompt: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
};

/**
 * ## question-id
 * 問題文 (コードブロック可)
 * - [ ] 選択肢
 * - [x] 正解の選択肢
 * > 解説
 */
export function parseQuiz(markdown: string, source: string): RawQuizQuestion[] {
  const questions: RawQuizQuestion[] = [];
  let current: { id: string; lines: string[] } | null = null;
  const sections: { id: string; lines: string[] }[] = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const heading = !inFence && /^## +(.+?)\s*$/.exec(line);
    if (heading) {
      current = { id: heading[1], lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  const ids = new Set<string>();
  for (const s of sections) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(s.id))
      throw new Error(`${source}: 問題 ID "${s.id}" は英小文字・数字・ハイフンで書いてください`);
    if (ids.has(s.id)) throw new Error(`${source}: 問題 ID "${s.id}" が重複しています`);
    ids.add(s.id);
    const prompt: string[] = [];
    const options: { text: string; correct: boolean }[] = [];
    const explanation: string[] = [];
    let fence = false;
    for (const line of s.lines) {
      if (/^\s*```/.test(line)) fence = !fence;
      const opt = !fence && /^- \[( |x)\] (.+)$/.exec(line);
      if (opt) {
        options.push({ text: opt[2], correct: opt[1] === 'x' });
      } else if (!fence && options.length > 0 && /^>/.test(line)) {
        explanation.push(line.replace(/^> ?/, ''));
      } else if (options.length === 0) {
        prompt.push(line);
      } else if (line.trim() !== '' && explanation.length === 0) {
        throw new Error(`${source} (${s.id}): 選択肢の後に解説 (> で始まる行) 以外の行があります: ${line}`);
      } else if (explanation.length > 0) {
        explanation.push(line);
      }
    }
    if (options.length < 2) throw new Error(`${source} (${s.id}): 選択肢は 2 つ以上必要です`);
    if (options.filter((o) => o.correct).length !== 1)
      throw new Error(`${source} (${s.id}): 正解 (- [x]) はちょうど 1 つにしてください`);
    if (explanation.join('').trim() === '') throw new Error(`${source} (${s.id}): 解説 (> ...) がありません`);
    questions.push({ id: s.id, prompt: prompt.join('\n').trim(), options, explanation: explanation.join('\n').trim() });
  }
  return questions;
}

async function loadQuiz(file: string, idPrefix: string): Promise<QuizQuestion[]> {
  if (!exists(file)) return [];
  const raw = parseQuiz(read(file), path.relative(process.cwd(), file));
  return Promise.all(
    raw.map(async (q) => ({
      id: `${idPrefix}:${q.id}`,
      promptHtml: await renderMarkdown(q.prompt),
      options: await Promise.all(
        q.options.map(async (o) => ({ html: await renderInlineMarkdown(o.text), correct: o.correct })),
      ),
      explanationHtml: await renderMarkdown(q.explanation),
    })),
  );
}

function quizIds(file: string, idPrefix: string): string[] {
  if (!exists(file)) return [];
  return parseQuiz(read(file), file).map((q) => `${idPrefix}:${q.id}`);
}

// ---------------------------------------------------------------------------
// 演習
// ---------------------------------------------------------------------------

type ExerciseFrontmatter = {
  title: string;
  optional?: boolean;
  typecheck?: boolean;
  preview?: string;
  hints?: string[];
};

export type RawExercise = {
  id: string;
  day: number;
  slug: string;
  dir: string;
  exam: boolean;
  meta: ExerciseFrontmatter;
  prompt: string;
  mainFile: string;
  starter: string;
  solution: string;
  testFile: string;
  files: ExerciseFile[];
};

function findOne(dir: string, base: string): string | undefined {
  return ['.ts', '.tsx'].map((ext) => base + ext).find((f) => exists(path.join(dir, f)));
}

export function readExercise(dir: string, day: number, exam: boolean): RawExercise {
  const slug = path.basename(dir);
  const rel = path.relative(process.cwd(), dir);
  const readme = path.join(dir, 'README.md');
  if (!exists(readme)) throw new Error(`${rel}: README.md がありません`);
  const { data, content } = matter(read(readme));
  const meta = data as ExerciseFrontmatter;
  if (!meta.title) throw new Error(`${rel}/README.md: title がありません`);
  const main = findOne(dir, 'main');
  const starter = findOne(dir, 'starter');
  const test = findOne(dir, 'test');
  if (!main || !starter || !test) throw new Error(`${rel}: main / starter / test の .ts(x) が揃っていません`);
  if (path.extname(main) !== path.extname(starter)) throw new Error(`${rel}: main と starter の拡張子が違います`);
  const support = fs
    .readdirSync(dir)
    .filter((f) => /\.tsx?$/.test(f) && !/\.d\.ts$/.test(f) && ![main, starter, test].includes(f))
    .sort();
  if (meta.preview && !support.includes(meta.preview))
    throw new Error(`${rel}: preview に指定した ${meta.preview} がありません`);
  const dayDir = dayDirName(day);
  const id = exam ? `${dayDir}/exam/${slug}` : `${dayDir}/${slug}`;
  return {
    id,
    day,
    slug,
    dir,
    exam,
    meta,
    prompt: content.trim(),
    mainFile: main,
    starter: read(path.join(dir, starter)),
    solution: read(path.join(dir, main)),
    testFile: test,
    files: [
      { name: test, code: read(path.join(dir, test)), role: 'test' as const },
      ...support.map((f) => ({ name: f, code: read(path.join(dir, f)), role: 'support' as const })),
    ],
  };
}

function exerciseDirs(parent: string): string[] {
  if (!exists(parent)) return [];
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(parent, d.name))
    .sort();
}

function summarize(r: RawExercise): ExerciseSummary {
  return {
    id: r.id,
    day: r.day,
    slug: r.slug,
    title: r.meta.title,
    optional: !!r.meta.optional,
    exam: r.exam,
    typecheck: !!r.meta.typecheck,
  };
}

async function toExercise(r: RawExercise): Promise<Exercise> {
  return {
    ...summarize(r),
    promptHtml: await renderMarkdown(r.prompt),
    hintsHtml: await Promise.all((r.meta.hints ?? []).map((h) => renderMarkdown(h))),
    mainFile: r.mainFile,
    starter: r.starter,
    solution: r.solution,
    testFile: r.testFile,
    files: r.files,
    preview: r.meta.preview,
  };
}

// ---------------------------------------------------------------------------
// 日ごとの教材
// ---------------------------------------------------------------------------

type LessonFrontmatter = {
  day: number;
  level: Level;
  title: string;
  summary: string;
  minutes: number;
  goals?: string[];
  readings?: Reading[];
};

type ExamFrontmatter = { title: string; level: Level; passScore?: number };

export function listDayNumbers(): number[] {
  if (!exists(DAYS_DIR)) return [];
  return fs
    .readdirSync(DAYS_DIR)
    .map((d) => /^day(\d+)$/.exec(d))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b);
}

export function listRawExercises(day: number): { regular: RawExercise[]; exam: RawExercise[] } {
  const dir = path.join(DAYS_DIR, dayDirName(day));
  return {
    regular: exerciseDirs(path.join(dir, 'exercises')).map((d) => readExercise(d, day, false)),
    exam: exerciseDirs(path.join(dir, 'exam', 'exercises')).map((d) => readExercise(d, day, true)),
  };
}

function readLesson(day: number) {
  const file = path.join(DAYS_DIR, dayDirName(day), 'lesson.md');
  const { data, content } = matter(read(file));
  const fm = data as LessonFrontmatter;
  if (fm.day !== day) throw new Error(`${file}: frontmatter の day (${fm.day}) がディレクトリ名と一致しません`);
  for (const key of ['level', 'title', 'summary', 'minutes'] as const) {
    if (fm[key] === undefined) throw new Error(`${file}: frontmatter に ${key} がありません`);
  }
  return { fm, content };
}

function readExamMeta(day: number) {
  const file = path.join(DAYS_DIR, dayDirName(day), 'exam', 'exam.md');
  if (!exists(file)) return null;
  const { data, content } = matter(read(file));
  const fm = data as ExamFrontmatter;
  if (!fm.title || !fm.level) throw new Error(`${file}: title と level が必要です`);
  return { fm, content };
}

const metaCache = new Map<number, DayMeta>();

export function getDayMeta(day: number): DayMeta {
  const cached = metaCache.get(day);
  if (cached) return cached;
  const { fm } = readLesson(day);
  const dir = path.join(DAYS_DIR, dayDirName(day));
  const { regular, exam } = listRawExercises(day);
  const examMeta = readExamMeta(day);
  const meta: DayMeta = {
    day,
    level: fm.level,
    title: fm.title,
    summary: fm.summary,
    minutes: fm.minutes,
    goals: fm.goals ?? [],
    readings: fm.readings ?? [],
    quizIds: quizIds(path.join(dir, 'quiz.md'), dayDirName(day)),
    exercises: regular.map(summarize),
    exam: examMeta
      ? {
          id: `${dayDirName(day)}/exam`,
          title: examMeta.fm.title,
          level: examMeta.fm.level,
          passScore: examMeta.fm.passScore ?? 80,
          quizIds: quizIds(path.join(dir, 'exam', 'quiz.md'), `${dayDirName(day)}/exam`),
          exercises: exam.map(summarize),
        }
      : undefined,
  };
  metaCache.set(day, meta);
  return meta;
}

export function getAllDayMeta(): DayMeta[] {
  return listDayNumbers().map(getDayMeta);
}

export async function getDay(day: number): Promise<Day> {
  const { content } = readLesson(day);
  const dir = path.join(DAYS_DIR, dayDirName(day));
  const meta = getDayMeta(day);
  return {
    ...meta,
    goalsHtml: await Promise.all(meta.goals.map((g) => renderInlineMarkdown(g))),
    lessonHtml: await renderMarkdown(content),
    quiz: await loadQuiz(path.join(dir, 'quiz.md'), dayDirName(day)),
  };
}

export async function getExam(day: number): Promise<Exam | null> {
  const meta = getDayMeta(day);
  const examMeta = readExamMeta(day);
  if (!meta.exam || !examMeta) return null;
  return {
    id: meta.exam.id,
    day,
    level: meta.exam.level,
    title: meta.exam.title,
    passScore: meta.exam.passScore,
    introHtml: await renderMarkdown(examMeta.content),
    quiz: await loadQuiz(path.join(DAYS_DIR, dayDirName(day), 'exam', 'quiz.md'), `${dayDirName(day)}/exam`),
    exercises: meta.exam.exercises,
  };
}

export function listAllExerciseParams(): { day: string; slug: string; exam: boolean }[] {
  return listDayNumbers().flatMap((day) => {
    const { regular, exam } = listRawExercises(day);
    return [...regular, ...exam].map((r) => ({ day: String(day), slug: r.slug, exam: r.exam }));
  });
}

export async function getExercise(day: number, slug: string, exam: boolean): Promise<Exercise> {
  const dir = path.join(DAYS_DIR, dayDirName(day), ...(exam ? ['exam'] : []), 'exercises', slug);
  return toExercise(readExercise(dir, day, exam));
}

export function getAllExerciseSummaries(): ExerciseSummary[] {
  return getAllDayMeta().flatMap((d) => [...d.exercises, ...(d.exam?.exercises ?? [])]);
}

// ---------------------------------------------------------------------------
// 目標コード (解読マップ)
// ---------------------------------------------------------------------------

const TARGET_DIR = path.join(CONTENT_DIR, 'target');

export function readTargetSource(): { fileName: string; code: string; segments: TargetSegment[] } | null {
  const mapFile = path.join(TARGET_DIR, 'map.json');
  if (!exists(mapFile)) return null;
  const map = JSON.parse(read(mapFile)) as { file: string; segments: TargetSegment[] };
  return { fileName: map.file, code: read(path.join(TARGET_DIR, map.file)), segments: map.segments };
}

export async function getTargetCode(): Promise<TargetCode | null> {
  const src = readTargetSource();
  if (!src) return null;
  return {
    fileName: src.fileName,
    lines: src.code.replace(/\n$/, '').split('\n'),
    html: await highlightCode(src.code.replace(/\n$/, ''), 'tsx'),
    segments: src.segments,
  };
}

/** 復習用: すべてのクイズ (各日 + 試験) の問題 */
export async function getAllQuizQuestions(): Promise<(QuizQuestion & { day: number; source: string })[]> {
  const out: (QuizQuestion & { day: number; source: string })[] = [];
  for (const day of listDayNumbers()) {
    const dir = path.join(DAYS_DIR, dayDirName(day));
    for (const q of await loadQuiz(path.join(dir, 'quiz.md'), dayDirName(day)))
      out.push({ ...q, day, source: `Day ${day} クイズ` });
    for (const q of await loadQuiz(path.join(dir, 'exam', 'quiz.md'), `${dayDirName(day)}/exam`)) {
      out.push({ ...q, day, source: `Day ${day} 試験` });
    }
  }
  return out;
}
