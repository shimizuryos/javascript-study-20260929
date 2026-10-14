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
  /** 最後に更新した日時 (端末間で統合するとき、新しい方を採用する) */
  updatedAt?: string;
};

export type QuizAnswer = {
  choice: number;
  correct: boolean;
  at: string;
  /** 「もう一度解く」で消した印。消した記録も残さないと、同期で古い回答が復活してしまう */
  cleared?: boolean;
};

export type Progress = {
  version: 1;
  startDate: string | null;
  /** 学習開始日を自分で設定した日時 (自動で入った開始日より優先する) */
  startDateSetAt?: string;
  lessons: Record<string, string>;
  /** 通常クイズの回答 (問題 ID → { 選んだ番号, 正誤 }) */
  quiz: Record<string, QuizAnswer>;
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

/** 「もう一度解く」で消した回答は、回答していないものとして扱う */
export function quizAnswer(p: Progress, id: string): QuizAnswer | undefined {
  const a = p.quiz[id];
  return a && !a.cleared ? a : undefined;
}
