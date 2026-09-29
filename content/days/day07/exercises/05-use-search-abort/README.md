---
title: "(発展) AbortController で古いリクエストを中断する"
optional: true
hints:
  - "エフェクトの中で `const controller = new AbortController();` を作り、`search(q, controller.signal)` に渡します。クリーンアップは `return () => controller.abort();` です。"
  - "中断されたリクエストは、結果が届いても無視します: `.then((items) => { if (!controller.signal.aborted) setResults(items); })`"
  - "中断すると API は `AbortError` で失敗します。`.catch((e) => { if (!controller.signal.aborted) setError(e); })` のように、中断によるエラーは無視します。"
---

検索語 `q` が変わるたびに API を呼ぶフック `useSearch` を作ります。検索語を素早く変えると、**古いリクエストの結果が後から届いて、新しい結果を上書きしてしまう** 問題 (競合状態、race condition) があるので、AbortController で古いリクエストを中断します。

```ts
type SearchFn = (q: string, signal: AbortSignal) => Promise<string[]>;

const { results, error } = useSearch(q, search);
```

- `q` か `search` が変わるたびに `search(q, signal)` を呼び、結果を `results` として返す (最初は `[]`)
- `q` が変わったら、前のリクエストの `signal` を **中断 (abort)** する。アンマウントしたときも中断する
- 中断したリクエストの結果が後から届いても、`results` を上書きしない
- 中断ではない失敗は `error` として返す (最初は `null`)

これは、目標コード 41 行目 `queryFn: ({ signal }) => fetcher({ scope, page, q }, signal)` で TanStack Query が内部でやってくれていることです (Day 12)。
