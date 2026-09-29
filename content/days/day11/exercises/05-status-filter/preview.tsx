import { useState } from 'react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { IssueList, type Issue } from './main';

const issues: Issue[] = [
  { id: 1, title: 'ログインできない', status: 'open' },
  { id: 2, title: '表示が崩れる', status: 'closed' },
  { id: 3, title: '検索が遅い', status: 'open' },
];

/** プレビュー用: 今の URL を上に表示する (最初は想定外の ?status=done) */
export default function Preview() {
  const [query, setQuery] = useState('?status=done');
  return (
    <div>
      <p style={{ fontFamily: 'monospace' }}>URL: /issues{query}</p>
      <NuqsTestingAdapter searchParams="?status=done" hasMemory onUrlUpdate={(event) => setQuery(event.queryString)}>
        <IssueList issues={issues} />
      </NuqsTestingAdapter>
    </div>
  );
}
