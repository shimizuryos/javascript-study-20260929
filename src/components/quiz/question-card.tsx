'use client';

import type { QuizQuestion } from '@/content/types';

type Props = {
  question: QuizQuestion;
  index?: number;
  selected: number | null;
  /** true なら正誤と解説を表示する */
  revealed: boolean;
  onSelect: (choice: number) => void;
  disabled?: boolean;
  /** 不正解のとき「復習キューに入った」ことを表示する */
  reviewNote?: boolean;
};

const MARKS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionCard({ question, index, selected, revealed, onSelect, disabled, reviewNote }: Props) {
  const correctIndex = question.options.findIndex((o) => o.correct);
  const isCorrect = selected === correctIndex;
  return (
    <fieldset className="min-w-0 rounded-xl border border-line bg-card p-4 sm:p-5">
      <legend className="sr-only">問題 {index !== undefined ? index + 1 : ''}</legend>
      <div className="flex items-start gap-3">
        {index !== undefined && (
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-ink-2">
            {index + 1}
          </span>
        )}
        <div className="prose prose-compact min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: question.promptHtml }} />
      </div>
      <div className="mt-4 grid gap-2" role="radiogroup">
        {question.options.map((o, i) => {
          const chosen = selected === i;
          let tone = 'border-line hover:border-line-strong hover:bg-muted';
          if (revealed && i === correctIndex) tone = 'border-good bg-good-soft';
          else if (revealed && chosen) tone = 'border-bad bg-bad-soft';
          else if (chosen) tone = 'border-accent bg-accent-soft';
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={chosen}
              disabled={disabled || revealed}
              onClick={() => onSelect(i)}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${tone}`}
            >
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-line-strong text-[11px] font-bold text-ink-2">
                {MARKS[i]}
              </span>
              <span className="prose min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: o.html }} />
              {revealed && i === correctIndex && <span className="shrink-0 text-xs font-semibold text-good">正解</span>}
              {revealed && chosen && i !== correctIndex && (
                <span className="shrink-0 text-xs font-semibold text-bad">あなたの回答</span>
              )}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div
          className={`mt-4 rounded-lg border-l-4 p-3 text-sm ${isCorrect ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft'}`}
          role="status"
        >
          <p className="mb-1 font-bold">{selected === null ? '未回答' : isCorrect ? '正解!' : '不正解'}</p>
          <div className="prose prose-compact" dangerouslySetInnerHTML={{ __html: question.explanationHtml }} />
          {reviewNote && !isCorrect && (
            <p className="mt-2 text-xs text-ink-2">
              → この問題は「復習」に入りました。明日・3 日後・7 日後にもう一度出題されます。
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
