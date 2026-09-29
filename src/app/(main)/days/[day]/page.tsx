import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDay, getDayMeta, listDayNumbers, readTargetSource } from '@/lib/content';
import { Badge, Card, LevelTag } from '@/components/ui';
import { DaySteps } from '@/components/day/day-steps';
import { ExerciseList } from '@/components/day/exercise-list';
import { LessonReadButton } from '@/components/day/lesson-read-button';
import { PracticeQuiz } from '@/components/quiz/practice-quiz';
import { ExamCard } from '@/components/day/exam-card';
import { DayCompleteBanner } from '@/components/day/day-complete-banner';

type Props = { params: Promise<{ day: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listDayNumbers().map((day) => ({ day: String(day) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day } = await params;
  const d = await getDay(Number(day));
  return { title: `Day ${d.day} ${d.title}` };
}

export default async function DayPage({ params }: Props) {
  const { day: dayParam } = await params;
  const dayNumber = Number(dayParam);
  const days = listDayNumbers();
  if (!days.includes(dayNumber)) notFound();
  const day = await getDay(dayNumber);
  const prev = days[days.indexOf(dayNumber) - 1];
  const next = days[days.indexOf(dayNumber) + 1];
  const unlockedLines = (readTargetSource()?.segments ?? [])
    .filter((s) => s.day === dayNumber)
    .reduce((sum, s) => sum + (s.to - s.from + 1), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <nav className="text-sm text-ink-3" aria-label="パンくず">
          <Link href="/" className="hover:underline">
            ホーム
          </Link>{' '}
          / Day {day.day}
        </nav>
        <LevelTag level={day.level} />
        <h1 className="text-2xl leading-tight font-bold sm:text-3xl">
          <span className="mr-2 text-ink-3">Day {day.day}</span>
          {day.title}
        </h1>
        <p className="text-ink-2">{day.summary}</p>
        <p className="text-sm text-ink-3">目安 {day.minutes} 分</p>
      </div>

      <DaySteps meta={day} />
      <DayCompleteBanner
        meta={day}
        unlockedLines={unlockedLines}
        next={next ? { day: next, title: getDayMeta(next).title } : null}
      />

      {(day.goals.length > 0 || day.readings.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {day.goals.length > 0 && (
            <Card>
              <h2 className="mb-2 text-sm font-bold">今日できるようになること</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {day.goalsHtml.map((g) => (
                  <li key={g} className="prose text-sm" dangerouslySetInnerHTML={{ __html: g }} />
                ))}
              </ul>
            </Card>
          )}
          {day.readings.length > 0 && (
            <Card>
              <h2 className="mb-2 text-sm font-bold">公式ドキュメント・参考</h2>
              <ul className="space-y-1 text-sm">
                {day.readings.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-strong underline underline-offset-2"
                    >
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <section id="lesson" className="scroll-mt-20">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Badge tone="accent">1</Badge> レッスン
        </h2>
        <article className="prose" dangerouslySetInnerHTML={{ __html: day.lessonHtml }} />
        <div className="mt-8 flex justify-end border-t border-line pt-4">
          <LessonReadButton day={day.day} />
        </div>
      </section>

      {day.quiz.length > 0 && (
        <section id="quiz" className="scroll-mt-20">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Badge tone="accent">2</Badge> 確認クイズ
          </h2>
          <PracticeQuiz questions={day.quiz} />
        </section>
      )}

      <section id="exercises" className="scroll-mt-20">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold">
          <Badge tone="accent">3</Badge> 演習
        </h2>
        <p className="mb-4 text-sm text-ink-2">
          ブラウザ上でコードを書いて実行すると、自動テストで採点されます。「必須」をクリアするとこの日が完了になります。
        </p>
        <ExerciseList exercises={day.exercises} />
      </section>

      {day.exam && (
        <section id="exam" className="scroll-mt-20">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Badge tone="warn">4</Badge> 試験
          </h2>
          <ExamCard day={day.day} exam={day.exam} />
        </section>
      )}

      <nav className="flex justify-between gap-4 border-t border-line pt-6 text-sm" aria-label="前後の日">
        {prev ? (
          <Link href={`/days/${prev}/`} className="text-accent-strong hover:underline">
            ← Day {prev}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/days/${next}/`} className="text-accent-strong hover:underline">
            Day {next} →
          </Link>
        )}
      </nav>
    </div>
  );
}
