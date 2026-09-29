import { useState } from 'react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { Pager } from './main';

/** プレビュー用: ブラウザのアドレスバーの代わりに、今の URL を上に表示する */
export default function Preview() {
  const [query, setQuery] = useState('?page=2');
  return (
    <div>
      <p style={{ fontFamily: 'monospace' }}>URL: /articles{query}</p>
      <NuqsTestingAdapter searchParams="?page=2" hasMemory onUrlUpdate={(event) => setQuery(event.queryString)}>
        <Pager />
      </NuqsTestingAdapter>
    </div>
  );
}
