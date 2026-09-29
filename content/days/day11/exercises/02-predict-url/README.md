---
title: URL がどうなるか予想する
hints:
  - "変換できない値 (`?page=abc`) は「値が無い」扱いです。そのときの値は、withDefault があればデフォルト値、無ければ `null` です。"
  - "デフォルト値と同じ値をセットしたとき、`null` をセットしたときは、キーが URL から消えます。このフックが知らないキーは残ります。"
  - "`parseAsString` に空文字 `''` をセットしても、キーは消えません。"
---

**コードを読む力** をつける問題です。それぞれのコードを実行した結果を **予想して**、`main.ts` の `answers` に書き込んでください。

- Q1・Q2 は **値** (`1` や `null` など) を書きます
- Q3〜Q7 は実行後の URL のクエリ部分を、アドレスバーに見える形の文字列で書きます (例: `'?page=2&q=ts'`)。クエリが無くなるときは `''` です。キーの順番は問いません

```ts
// Q1: URL が ?page=abc のとき、page の値は?
const [page] = useQueryState('page', parseAsInteger.withDefault(1));

// Q2: URL が ?page=abc のとき、page の値は?
const [page] = useQueryState('page', parseAsInteger);

// Q3: URL が ?page=3&q=ts のとき、setPage(1) の後の URL は?
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

// Q4: URL が ?scope=mine&page=3&q=react のとき、setParams({ q: 'next', page: null }) の後の URL は?
const [params, setParams] = useQueryStates({
  scope: parseAsStringLiteral(['all', 'mine', 'team'] as const).withDefault('all'),
  page: parseAsInteger.withDefault(1),
  q: parseAsString,
});

// Q5: URL が ?tags=a のとき、setTags((old) => [...old, 'b']) の後の URL は?
const [tags, setTags] = useQueryState('tags', parseAsArrayOf(parseAsString).withDefault([]));

// Q6: URL が ?view=grid&page=2 のとき、setParams(null) の後の URL は?
const [params, setParams] = useQueryStates({
  page: parseAsInteger.withDefault(1),
  q: parseAsString,
});

// Q7: URL が ?q=react のとき、setQ('') の後の URL は?
const [q, setQ] = useQueryState('q', parseAsString);
```

テストは、実際にこれらのコードを `NuqsTestingAdapter` の中で動かして、あなたの答えと一致するかだけを確かめます (正解はメッセージに出ません)。間違えた問題は、なぜそうなるのかをレッスンで確認しましょう。
