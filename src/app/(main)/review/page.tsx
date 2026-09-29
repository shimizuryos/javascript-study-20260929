import type { Metadata } from 'next';
import { getAllQuizQuestions } from '@/lib/content';
import { ReviewSession } from '@/components/review/review-session';

export const metadata: Metadata = { title: '復習' };

export default async function ReviewPage() {
  const questions = await getAllQuizQuestions();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">復習</h1>
      <ReviewSession questions={questions} />
    </div>
  );
}
