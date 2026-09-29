'use client';

import { useProgress } from '@/lib/progress/store';
import { dueReviewIds } from '@/lib/progress/selectors';

export function ReviewBadge() {
  const count = dueReviewIds(useProgress()).length;
  if (count === 0) return null;
  return (
    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">
      {count}
    </span>
  );
}
