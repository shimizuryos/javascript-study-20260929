'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { DayMeta, TargetCode } from '@/content/types';
import { LEVELS } from '@/content/types';
import { useProgress, useProgressReady } from '@/lib/progress/store';
import { dueReviewIds, overview, plannedDay, streak } from '@/lib/progress/selectors';
import { useToday } from '@/lib/use-today';
import { Card, LevelDot, Meter } from '@/components/ui';
import { ActivityHeatmap } from './activity-heatmap';
import { DayPlan } from './day-plan';
import { TargetMap } from './target-map';

function StatTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <p className="text-xs text-ink-2">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-3">{sub}</p>}
    </div>
  );
}

export function Dashboard({ metas, target }: { metas: DayMeta[]; target: TargetCode | null }) {
  const progress = useProgress();
  const ready = useProgressReady();
  const today = useToday();
  const ov = useMemo(() => overview(metas, progress), [metas, progress]);
  const st = useMemo(() => streak(progress.activity, today), [progress.activity, today]);
  const due = dueReviewIds(progress, today).length;
  const doneDays = useMemo(() => new Set(ov.days.filter((d) => d.status === 'done').map((d) => d.day)), [ov]);
  const planned = plannedDay(progress.startDate, today);
  const next = ov.nextDay ? metas.find((m) => m.day === ov.nextDay) : null;
  const nextProgress = next ? ov.days.find((d) => d.day === next.day) : null;
  const started = Object.keys(progress.activity).length > 0;

  return (
    <div className={`space-y-6 transition-opacity ${ready ? 'opacity-100' : 'opacity-0'}`}>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
          <p className="text-sm text-ink-2">
            {started ? (planned && planned > 0 ? `学習開始から ${planned} 日目` : 'おかえりなさい') : 'ようこそ'}
          </p>
          {next ? (
            <>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                {started ? '次は' : 'まずは'} Day {next.day}「{next.title}」
              </h1>
              <p className="mt-2 text-sm text-ink-2">{next.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/days/${next.day}/`}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
                >
                  {nextProgress && nextProgress.done > 0 ? '続きから' : '始める'} →
                </Link>
                <span className="text-xs text-ink-3">目安 {next.minutes} 分</span>
                {planned !== null && planned > next.day && (
                  <span className="text-xs text-warn">予定より {planned - next.day} 日遅れています (焦らなくて大丈夫)</span>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-1 text-2xl font-bold">全 {metas.length} 日を修了しました 🎉</h1>
              <p className="mt-2 text-sm text-ink-2">復習キューと演習一覧で、苦手なところを繰り返しましょう。</p>
            </>
          )}
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="text-sm text-ink-2">全体の進捗</p>
          <p className="mt-1 text-5xl font-bold tabular-nums">
            {Math.round(ov.ratio * 100)}
            <span className="text-2xl">%</span>
          </p>
          <Meter value={ov.ratio} label="全体の進捗" className="mt-3" />
          <p className="mt-2 text-xs text-ink-3">レッスン・クイズ・必須演習・試験の達成数から計算</p>
        </div>
      </section>

      <section aria-label="学習の状況" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="完了した日" value={`${ov.daysDone} / ${metas.length}`} sub="Day ごとの全項目を達成" />
        <StatTile label="必須演習" value={`${ov.exercisesPassed} / ${ov.exercisesTotal}`} sub="テストに合格した数" />
        <StatTile label="試験" value={`${ov.examsPassed} / ${ov.examsTotal}`} sub="80% 以上で合格" />
        <StatTile
          label="連続学習"
          value={`${st.count} 日`}
          sub={st.studiedToday ? '今日も学習済み' : st.count > 0 ? '今日学習すると継続' : '今日から始めよう'}
        />
      </section>

      {due > 0 && (
        <Link
          href="/review/"
          className="flex items-center justify-between gap-3 rounded-xl border border-accent bg-accent-soft p-4 text-sm"
        >
          <span>
            <strong>復習 {due} 問</strong> が今日の出題日です。間違えた問題を 1・3・7 日後に出し直します。
          </span>
          <span className="shrink-0 font-semibold text-accent-strong">復習する →</span>
        </Link>
      )}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <h2 className="mb-3 font-bold">14 日間のプラン</h2>
          <DayPlan metas={metas} days={ov.days} startDate={progress.startDate} today={today} nextDay={ov.nextDay} />
        </Card>
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-bold">レベル別</h2>
            <ul className="space-y-3">
              {ov.byLevel.map(({ level, done, total }) => (
                <li key={level}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <LevelDot level={level} />
                      {LEVELS[level].name}
                    </span>
                    <span className="text-xs text-ink-2 tabular-nums">{total ? Math.round((done / total) * 100) : 0}%</span>
                  </div>
                  <Meter value={total ? done / total : 0} color={`var(--level-${level})`} label={`Level ${level} の進捗`} />
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="mb-3 font-bold">学習記録</h2>
            <ActivityHeatmap activity={progress.activity} frozen={st.frozen} />
            <p className="mt-3 text-xs text-ink-3">週に 1 日までは休んでも連続記録が途切れません (点線の枠)。</p>
          </Card>
        </div>
      </section>

      {target && (
        <Card>
          <h2 className="font-bold">解読マップ — ゴールのコード</h2>
          <p className="mt-1 mb-4 text-sm text-ink-2">
            nuqs・TanStack Query・TanStack Table を組み合わせた自作フックの代表例です。社内コードの
            <code className="mx-1 font-mono">useSharedScopeQuery</code>
            もこれに近い形のはず。Day を完了するたびに読める行が増えていきます。
          </p>
          <TargetMap target={target} doneDays={doneDays} nextDay={ov.nextDay} />
        </Card>
      )}
    </div>
  );
}
