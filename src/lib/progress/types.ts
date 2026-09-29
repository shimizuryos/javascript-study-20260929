export type ExerciseProgress = {
  attempts: number;
  passedAt?: string;
  /** 解答を表示したか (試験では 0 点になる) */
  revealed?: boolean;
  /** 解答を見る前に合格したか */
  passedBeforeReveal?: boolean;
};

export type ExamProgress = {
  attempts: number;
  best: number;
  passedAt?: string;
  lastAt: string;
  /** 試験クイズの回答 (問題 ID → 選択肢の番号) */
  answers?: Record<string, number>;
};

export type ReviewCard = {
  /** ライトナー方式の箱: 1 → 1 日後, 2 → 3 日後, 3 → 7 日後, 4 → 卒業 */
  box: 1 | 2 | 3 | 4;
  due: string;
};

export type Progress = {
  version: 1;
  startDate: string | null;
  lessons: Record<string, string>;
  /** 通常クイズの回答 (問題 ID → { 選んだ番号, 正誤 }) */
  quiz: Record<string, { choice: number; correct: boolean; at: string }>;
  exercises: Record<string, ExerciseProgress>;
  exams: Record<string, ExamProgress>;
  review: Record<string, ReviewCard>;
  /** 日付 → その日の学習アクション数 */
  activity: Record<string, number>;
};

export const EMPTY_PROGRESS: Progress = {
  version: 1,
  startDate: null,
  lessons: {},
  quiz: {},
  exercises: {},
  exams: {},
  review: {},
  activity: {},
};
