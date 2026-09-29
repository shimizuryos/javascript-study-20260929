import type { Metadata } from 'next';
import { getDayMeta, getExercise, listAllExerciseParams } from '@/lib/content';
import { Workbench } from '@/components/workbench/workbench';

type Props = { params: Promise<{ day: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listAllExerciseParams()
    .filter((p) => p.exam)
    .map(({ day, slug }) => ({ day, slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day, slug } = await params;
  const ex = await getExercise(Number(day), slug, true);
  return { title: `${ex.title} (Day ${day} 試験)` };
}

export default async function ExamExercisePage({ params }: Props) {
  const { day, slug } = await params;
  const dayNumber = Number(day);
  const exercise = await getExercise(dayNumber, slug, true);
  const list = getDayMeta(dayNumber).exam?.exercises ?? [];
  const next = list[list.findIndex((e) => e.slug === slug) + 1];
  return (
    <Workbench
      key={exercise.id}
      exercise={exercise}
      nav={{
        back: { href: `/days/${day}/exam/`, label: '試験のページ' },
        next: next ? { href: `/days/${day}/exam/exercises/${next.slug}/`, label: `次の問題「${next.title}」` } : undefined,
      }}
    />
  );
}
