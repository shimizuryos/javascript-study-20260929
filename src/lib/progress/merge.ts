/**
 * 2 つの端末の進捗を 1 つにまとめる。
 * 同期のたびに何度も呼ばれるので、「何回まとめても結果が同じ (冪等)」「順番を入れ替えても同じ (可換)」
 * になるように、項目ごとに「新しい方」「進んでいる方」を選ぶルールにしている。
 */
import type { ExamProgress, ExerciseProgress, Progress, QuizAnswer, ReviewCard } from './types';

const earlier = (a?: string, b?: string) => (!a ? b : !b ? a : a <= b ? a : b);

function mergeRecord<T>(a: Record<string, T>, b: Record<string, T>, pick: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in out ? pick(out[k], v) : v;
  return out;
}

function pickQuiz(a: QuizAnswer, b: QuizAnswer): QuizAnswer {
  if (a.at !== b.at) return a.at > b.at ? a : b;
  // 同時刻なら決定的に選ぶ (どちらの端末でまとめても同じ結果にするため)
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
}

function pickExercise(a: ExerciseProgress, b: ExerciseProgress): ExerciseProgress {
  const out: ExerciseProgress = { attempts: Math.max(a.attempts, b.attempts) };
  const passedAt = earlier(a.passedAt, b.passedAt);
  if (passedAt) out.passedAt = passedAt;
  if (a.revealed || b.revealed) out.revealed = true;
  if (a.passedBeforeReveal || b.passedBeforeReveal) out.passedBeforeReveal = true;
  return out;
}

function pickExam(a: ExamProgress, b: ExamProgress): ExamProgress {
  const latest = a.lastAt >= b.lastAt ? a : b;
  const out: ExamProgress = {
    attempts: Math.max(a.attempts, b.attempts),
    best: Math.max(a.best, b.best),
    lastAt: latest.lastAt,
  };
  const passedAt = earlier(a.passedAt, b.passedAt);
  if (passedAt) out.passedAt = passedAt;
  if (latest.answers) out.answers = latest.answers;
  return out;
}

function pickReview(a: ReviewCard, b: ReviewCard): ReviewCard {
  if (a.updatedAt || b.updatedAt) {
    if ((a.updatedAt ?? '') !== (b.updatedAt ?? '')) return (a.updatedAt ?? '') > (b.updatedAt ?? '') ? a : b;
  }
  if (a.box !== b.box) return a.box > b.box ? a : b;
  return a.due >= b.due ? a : b;
}

function pickStartDate(a: Progress, b: Progress): Pick<Progress, 'startDate' | 'startDateSetAt'> {
  // 自分で設定した開始日があれば、新しく設定した方を優先する
  if (a.startDateSetAt || b.startDateSetAt) {
    const winner = (a.startDateSetAt ?? '') >= (b.startDateSetAt ?? '') ? a : b;
    return { startDate: winner.startDate, startDateSetAt: winner.startDateSetAt };
  }
  const dates = [a.startDate, b.startDate].filter((d): d is string => !!d).sort();
  return { startDate: dates[0] ?? null };
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const start = pickStartDate(a, b);
  const merged: Progress = {
    version: 1,
    startDate: start.startDate,
    lessons: mergeRecord(a.lessons, b.lessons, (x, y) => earlier(x, y)!),
    quiz: mergeRecord(a.quiz, b.quiz, pickQuiz),
    exercises: mergeRecord(a.exercises, b.exercises, pickExercise),
    exams: mergeRecord(a.exams, b.exams, pickExam),
    review: mergeRecord(a.review, b.review, pickReview),
    // 同じ日に複数の端末で学習した回数は足さずに大きい方を使う (何度まとめても増えないように)
    activity: mergeRecord(a.activity, b.activity, (x, y) => Math.max(x, y)),
  };
  if (start.startDateSetAt) merged.startDateSetAt = start.startDateSetAt;
  return merged;
}

/** キーの順番に関係なく、内容が同じかどうか */
export function sameProgress(a: Progress, b: Progress): boolean {
  return canonical(a) === canonical(b);
}

function canonical(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'undefined';
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  return `{${Object.keys(v)
    .filter((k) => (v as Record<string, unknown>)[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`)
    .join(',')}}`;
}
