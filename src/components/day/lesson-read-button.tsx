'use client';

import { progressActions, useProgress } from '@/lib/progress/store';
import { CheckIcon } from '@/components/ui';

export function LessonReadButton({ day }: { day: number }) {
  const read = !!useProgress().lessons[String(day)];
  return read ? (
    <p className="flex items-center gap-2 text-sm font-semibold text-good">
      <CheckIcon />
      レッスン読了
    </p>
  ) : (
    <button
      type="button"
      onClick={() => progressActions.markLessonRead(day)}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
    >
      読み終えた → クイズへ
    </button>
  );
}
