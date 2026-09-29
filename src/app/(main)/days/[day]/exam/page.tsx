import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getExam, listDayNumbers, getDayMeta } from '@/lib/content';
import { LEVELS } from '@/content/types';
import { ExamRunner } from '@/components/exam/exam-runner';
import { LevelTag } from '@/components/ui';

type Props = { params: Promise<{ day: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listDayNumbers()
    .filter((d) => getDayMeta(d).exam)
    .map((d) => ({ day: String(d) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day } = await params;
  const exam = await getExam(Number(day));
  return { title: exam?.title ?? '試験' };
}

export default async function ExamPage({ params }: Props) {
  const { day } = await params;
  const exam = await getExam(Number(day));
  if (!exam) notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm text-ink-3" aria-label="パンくず">
        <Link href="/" className="hover:underline">
          ホーム
        </Link>{' '}
        /{' '}
        <Link href={`/days/${day}/`} className="hover:underline">
          Day {day}
        </Link>{' '}
        / 試験
      </nav>
      <div className="space-y-2">
        <LevelTag level={exam.level} />
        <h1 className="text-2xl font-bold sm:text-3xl">{exam.title}</h1>
        <p className="text-sm text-ink-2">
          範囲: {LEVELS[exam.level].name}・合格ライン {exam.passScore}%
        </p>
      </div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: exam.introHtml }} />
      <ExamRunner exam={exam} />
    </div>
  );
}
