/** 教材データの型。content/ 以下のファイルをビルド時に読み込んでこの形にする。 */

export type Level = 1 | 2 | 3 | 4 | 5;

export const LEVELS: Record<Level, { name: string; short: string }> = {
  1: { name: 'JavaScript / TypeScript の文法', short: 'JS/TS' },
  2: { name: 'React', short: 'React' },
  3: { name: 'Next.js (App Router)', short: 'Next.js' },
  4: { name: 'ライブラリ (nuqs / TanStack)', short: 'ライブラリ' },
  5: { name: '総仕上げ', short: '総仕上げ' },
};

export type Reading = { title: string; url: string };

export type QuizOption = { html: string; correct: boolean };

export type QuizQuestion = {
  /** 例: "day01:default-value" (進捗の保存キー) */
  id: string;
  promptHtml: string;
  options: QuizOption[];
  explanationHtml: string;
};

export type ExerciseFile = {
  name: string;
  code: string;
  role: 'test' | 'support';
};

export type Exercise = {
  /** 例: "day01/01-swap", "day04/exam/01-parse" */
  id: string;
  day: number;
  slug: string;
  title: string;
  promptHtml: string;
  optional: boolean;
  exam: boolean;
  typecheck: boolean;
  hintsHtml: string[];
  /** 学習者が編集するファイル名 (main.ts / main.tsx) */
  mainFile: string;
  starter: string;
  solution: string;
  testFile: string;
  /** テストと補助ファイル (読み取り専用で表示) */
  files: ExerciseFile[];
  /** プレビューとして描画するファイル名 */
  preview?: string;
};

export type ExerciseSummary = Pick<Exercise, 'id' | 'day' | 'slug' | 'title' | 'optional' | 'exam' | 'typecheck'>;

export type Exam = {
  id: string;
  day: number;
  level: Level;
  title: string;
  passScore: number;
  introHtml: string;
  quiz: QuizQuestion[];
  exercises: ExerciseSummary[];
};

export type DayMeta = {
  day: number;
  level: Level;
  title: string;
  summary: string;
  minutes: number;
  goals: string[];
  readings: Reading[];
  quizIds: string[];
  exercises: ExerciseSummary[];
  exam?: { id: string; title: string; level: Level; passScore: number; quizIds: string[]; exercises: ExerciseSummary[] };
};

export type Day = DayMeta & {
  goalsHtml: string[];
  lessonHtml: string;
  quiz: QuizQuestion[];
};

export type TargetSegment = { from: number; to: number; day: number; note: string };

export type TargetCode = {
  fileName: string;
  lines: string[];
  html: string;
  segments: TargetSegment[];
};
