'use client';

/**
 * 学習の進捗を localStorage に保存するストア。
 * useSyncExternalStore で購読するので、どのコンポーネントからでも同じ値が見える。
 * (サーバー側の静的生成では空の進捗として描画され、ブラウザで読み込み後に置き換わる)
 */
import { useSyncExternalStore } from 'react';
import { addDays, todayKey } from '../dates';
import { EMPTY_PROGRESS, type Progress, type ReviewCard } from './types';

const KEY = 'js-study:progress:v1';
const DRAFT_PREFIX = 'js-study:draft:';
const EXPORTED_KEY = 'js-study:exported-at';

let state: Progress = EMPTY_PROGRESS;
let loaded = false;
const listeners = new Set<() => void>();

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 容量オーバーやプライベートモード。進捗はメモリ上には残る
  }
}

function normalize(raw: unknown): Progress {
  if (!raw || typeof raw !== 'object' || (raw as Progress).version !== 1) return EMPTY_PROGRESS;
  return { ...EMPTY_PROGRESS, ...(raw as Progress) };
}

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  const text = safeGet(KEY);
  if (text) {
    try {
      state = normalize(JSON.parse(text));
    } catch {
      state = EMPTY_PROGRESS;
    }
  }
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    try {
      state = normalize(JSON.parse(e.newValue ?? 'null'));
    } catch {
      state = EMPTY_PROGRESS;
    }
    listeners.forEach((l) => l());
  });
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureLoaded();
  return state;
}

const getServerSnapshot = () => EMPTY_PROGRESS;

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 読み込みが終わったか (サーバー描画 / ハイドレーション直後は false) */
export function useProgressReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function update(recipe: (draft: Progress) => Progress, countActivity = true) {
  ensureLoaded();
  let next = recipe(state);
  if (countActivity) {
    const today = todayKey();
    next = {
      ...next,
      startDate: next.startDate ?? today,
      activity: { ...next.activity, [today]: (next.activity[today] ?? 0) + 1 },
    };
  }
  state = next;
  safeSet(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

const REVIEW_INTERVALS: Record<ReviewCard['box'], number> = { 1: 1, 2: 3, 3: 7, 4: 0 };

export const progressActions = {
  markLessonRead(day: number) {
    update((p) => ({ ...p, lessons: { ...p.lessons, [String(day)]: new Date().toISOString() } }));
  },

  answerQuiz(questionId: string, choice: number, correct: boolean) {
    update((p) => {
      const review = { ...p.review };
      if (!correct && !review[questionId]) {
        // 間違えた問題は翌日から復習キューへ
        review[questionId] = { box: 1, due: addDays(todayKey(), 1) };
      }
      return { ...p, quiz: { ...p.quiz, [questionId]: { choice, correct, at: new Date().toISOString() } }, review };
    });
  },

  resetQuiz(questionIds: string[]) {
    update((p) => {
      const quiz = { ...p.quiz };
      for (const id of questionIds) delete quiz[id];
      return { ...p, quiz };
    }, false);
  },

  answerReview(questionId: string, correct: boolean) {
    update((p) => {
      const card = p.review[questionId] ?? { box: 1, due: todayKey() };
      const box = (correct ? Math.min(card.box + 1, 4) : 1) as ReviewCard['box'];
      const next: ReviewCard = { box, due: box === 4 ? '9999-12-31' : addDays(todayKey(), REVIEW_INTERVALS[box]) };
      return { ...p, review: { ...p.review, [questionId]: next } };
    });
  },

  recordRun(exerciseId: string, passed: boolean) {
    update((p) => {
      const prev = p.exercises[exerciseId] ?? { attempts: 0 };
      const firstPass = passed && !prev.passedAt;
      return {
        ...p,
        exercises: {
          ...p.exercises,
          [exerciseId]: {
            ...prev,
            attempts: prev.attempts + 1,
            passedAt: prev.passedAt ?? (passed ? new Date().toISOString() : undefined),
            passedBeforeReveal: prev.passedBeforeReveal || (firstPass && !prev.revealed),
          },
        },
      };
    });
  },

  revealSolution(exerciseId: string) {
    update((p) => {
      const prev = p.exercises[exerciseId] ?? { attempts: 0 };
      return { ...p, exercises: { ...p.exercises, [exerciseId]: { ...prev, revealed: true } } };
    }, false);
  },

  recordExam(examId: string, score: number, passScore: number, answers: Record<string, number>, wrongIds: string[]) {
    update((p) => {
      const prev = p.exams[examId];
      const now = new Date().toISOString();
      const review = { ...p.review };
      for (const id of wrongIds) {
        if (!review[id] || review[id].box === 4) review[id] = { box: 1, due: addDays(todayKey(), 1) };
      }
      return {
        ...p,
        review,
        exams: {
          ...p.exams,
          [examId]: {
            attempts: (prev?.attempts ?? 0) + 1,
            best: Math.max(prev?.best ?? 0, score),
            passedAt: prev?.passedAt ?? (score >= passScore ? now : undefined),
            lastAt: now,
            answers,
          },
        },
      };
    });
  },

  setStartDate(date: string | null) {
    update((p) => ({ ...p, startDate: date }), false);
  },

  replaceAll(next: Progress) {
    update(() => normalize(next), false);
  },

  resetAll() {
    update(() => EMPTY_PROGRESS, false);
  },
};

// ---------------------------------------------------------------------------
// 演習の書きかけコード (進捗とは別キーに保存)
// ---------------------------------------------------------------------------

export function loadDraft(exerciseId: string): string | null {
  if (typeof window === 'undefined') return null;
  return safeGet(DRAFT_PREFIX + exerciseId);
}

export function saveDraft(exerciseId: string, code: string) {
  safeSet(DRAFT_PREFIX + exerciseId, code);
}

export function clearDraft(exerciseId: string) {
  try {
    window.localStorage.removeItem(DRAFT_PREFIX + exerciseId);
  } catch {
    // 無視
  }
}

export function listDrafts(): Record<string, string> {
  const drafts: Record<string, string> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(DRAFT_PREFIX))
        drafts[key.slice(DRAFT_PREFIX.length)] = window.localStorage.getItem(key) ?? '';
    }
  } catch {
    // 無視
  }
  return drafts;
}

export function restoreDrafts(drafts: Record<string, string>) {
  for (const [id, code] of Object.entries(drafts)) saveDraft(id, code);
}

// ---------------------------------------------------------------------------
// 最後にエクスポートした日時 (バックアップを促すため)
// ---------------------------------------------------------------------------

const exportListeners = new Set<() => void>();

export function markExported() {
  safeSet(EXPORTED_KEY, new Date().toISOString());
  exportListeners.forEach((l) => l());
}

function subscribeExported(listener: () => void) {
  exportListeners.add(listener);
  return () => exportListeners.delete(listener);
}

/** まだ一度もエクスポートしていなければ null (サーバー描画中は 'unknown') */
export function useExportedAt(): string | null {
  return useSyncExternalStore(
    subscribeExported,
    () => safeGet(EXPORTED_KEY),
    () => 'unknown',
  );
}
