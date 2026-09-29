## scope-q-types

目標コードの 37 行目で取り出される `scope` と `q` の型の組み合わせはどれですか?

```ts
const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
```

- [ ] `scope: string`、`q: string`
- [ ] `scope: Scope | null`、`q: string | null`
- [x] `scope: Scope` (`'all' | 'mine' | 'team'`)、`q: string | null`
- [ ] `scope: Scope`、`q: string | undefined`

> `withDefault` を付けたパーサーは、URL に値が無くてもデフォルト値を返すので、型から `null` が消えます (Day 11)。`parseAsStringLiteral(SCOPES)` は `SCOPES` の要素のユニオン型 `Scope` を返します (Day 3)。`q` には `withDefault` が無いので、URL に無いときは `null` になり、型は `string | null` です。`undefined` ではない点にも注意しましょう。

## why-page-minus-one

46 行目で `page - 1` としている理由として正しいものはどれですか?

```ts
const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);
```

- [ ] `useMemo` の依存配列が変わったことを React に知らせるため
- [x] URL の `page` は 1 始まり、TanStack Table の `pageIndex` は 0 始まりだから
- [ ] `parseAsInteger` が 1 大きい値を返す仕様だから
- [ ] API が 0 始まりのページ番号を受け取るから

> URL には人が読みやすい 1 始まりの番号 (`?page=2` = 2 ページ目) を置き、TanStack Table には 0 始まりの `pageIndex` を渡します (Day 13)。書き戻す 50 行目では逆に `next.pageIndex + 1` しています。API (fetcher) には URL と同じ 1 始まりの `page` がそのまま渡っています。

## updater-function

49 行目の `typeof updater === 'function'` は、どんな場合を扱うための分岐ですか?

```ts
const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
  const next = typeof updater === 'function' ? updater(pagination) : updater;
  void setParams({ page: next.pageIndex + 1 });
};
```

- [ ] `setParams` が関数かどうかを確かめ、未定義のときのエラーを防ぐ場合
- [ ] `pagination` がまだ計算されていない最初のレンダーの場合
- [x] テーブルが「前の値を受け取って新しい値を返す関数」を渡してきた場合 (`table.nextPage()` など)
- [ ] ユーザーがページ番号を直接入力した場合

> `OnChangeFn<T>` の引数は `Updater<T>` = `T | ((old: T) => T)` です (Day 13)。関数なら今の `pagination` を渡して新しい値を計算します。`setCount((prev) => prev + 1)` と同じ考え方です (Day 6)。TanStack Table v8 の `nextPage()` などは、いつも関数の形で渡してきます。

## remove-as-const-keys

`SCOPE_KEYS` から `as const` を消すと、何が起きますか?

```ts
export const SCOPE_KEYS = { scope: 'scope', page: 'page', q: 'q' }; // as const を消した
const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};
```

- [ ] 実行時に URL のキー名が `'SCOPE_KEYS.page'` のような文字列になる
- [ ] 何も変わらない (`as const` は実行時の値にしか影響しない)
- [x] 実行時の動きは同じだが、キーの型が `string` になり、`{ scope, page, q }` の型が `string | number | null` に広がる
- [ ] `SCOPE_KEYS` が読み取り専用でなくなるので、`useQueryStates` が実行時にエラーを投げる

> `as const` が無いと `SCOPE_KEYS.page` の型は `'page'` ではなく `string` になります (Day 3)。計算されたキー `[SCOPE_KEYS.page]` の型も `string` になり (Day 2)、`scopeParsers` は「どんな文字列キーでも持てるオブジェクト」の型になってしまいます。その結果 `scope` も `page` も `string | number | null` という曖昧な型になり、型による保護が失われます (続く `page - 1` や `fetcher({ scope, page, q }, signal)` の行が型エラーになります)。実行時の値 (`'page'` という文字列) は変わらないので、実行時エラーにはなりません。

## page-null

53 行目の `page: null` は何をしていますか?

```ts
const setScope = (next: Scope) => setParams({ scope: next, page: null });
```

- [ ] `page` を `null` にするので、次のレンダーで `page` の値が `null` になる
- [x] URL から `page` を消す。値はデフォルトの `1` に戻る (1 ページ目から表示し直す)
- [ ] `page` は変更しない (`null` は「変更なし」の意味)
- [ ] URL が `?page=null` になる

> nuqs では `null` をセットするとキーが URL から消えます (Day 11)。`page` のパーサーには `withDefault(1)` があるので、値は `1` になります。表示範囲を変えたら 1 ページ目に戻す、という定石です。「変更なし」にしたいキーは、そもそも渡しません。

## search-querykey

`useSharedScopeQuery('members', fetchMembers)` を使っている画面で、URL が `?scope=team&page=3` のときに `setSearch('田')` を呼びました。その後の queryKey はどれですか?

```ts
queryKey: [resource, { scope, page, q, pageSize }] as const,
// ...
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

- [ ] `['members', { scope: 'team', page: 3, q: '田', pageSize: 20 }]`
- [x] `['members', { scope: 'team', page: 1, q: '田', pageSize: 20 }]`
- [ ] `['members', { scope: 'all', page: 1, q: '田', pageSize: 20 }]`
- [ ] `['members', { scope: 'team', page: 3, q: null, pageSize: 20 }]` (検索語は queryKey に入らない)

> `setSearch` は `q` と同時に `page: null` もセットするので、`page` はデフォルトの `1` になります (Day 11)。`scope` は渡していないので `'team'` のままです。`pageSize` は第 3 引数を省略したのでデフォルトの `20` です (Day 1)。queryKey が変わるので、TanStack Query が自動で取り直します (Day 12)。

## or-vs-nullish

54 行目の `text || null` を `text ?? null` に書き換えました。`setSearch('')` を呼んだ後の URL はどうなりますか?

```ts
const setSearch = (text: string) => setParams({ q: text ?? null, page: null }); // ?? に変えた
```

- [ ] 変わらない (`q` は URL から消える)
- [x] `''` は `null` にならないので、空の `q` が残る (`?q=`)
- [ ] `q=null` という文字列が URL に入る
- [ ] 型エラーでコンパイルできない

> `??` は左辺が `null` / `undefined` のときだけ右辺を使うので、空文字 `''` はそのまま `q` に入ります (Day 2)。`parseAsString` にはデフォルト値が無いので `clearOnDefault` も働かず、URL には `?q=` が残ります。`||` は `''` も「偽」とみなすので `null` になり、キーが消えます。

## keep-previous-data

`placeholderData: keepPreviousData` についての説明で、正しいものはどれですか?

- [ ] 前のページのデータを保存しておき、同じページを開いたときに API を呼ばないようにする
- [x] 新しい queryKey のデータがまだ無い間、直前に表示していたデータを仮に返し、`isPlaceholderData` を `true` にする
- [ ] 取得に失敗したとき、前のデータを表示し続ける
- [ ] 新しい queryKey のデータが届くまで `isPending` を `true` にし、`rows` を `[]` にする

> `keepPreviousData` は「今のキーのデータがキャッシュに無いときに、前のデータを仮表示する」ための関数です (Day 12)。仮表示の間は `isPlaceholderData: true`、`isFetching: true`、`isPending: false` です。キャッシュにあるページへ戻ったときは本物のデータが表示されるので `isPlaceholderData` は `false` です (Day 14)。キャッシュの保持や API 呼び出しの抑制は staleTime / gcTime の役目です。

## use-client

目標コードの 1 行目に `'use client'` がある理由として最も適切なものはどれですか?

- [ ] このファイルを読み込むと、ページ全体がクライアント側だけで描画されるようにするため
- [x] 中で `useQuery` / `useQueryStates` / `useMemo` などのフックを使うので、Client Components 側のコードだと宣言するため
- [ ] `fetch` はブラウザでしか使えないため
- [ ] nuqs と TanStack Query のライセンス上の決まりだから

> `useMemo` などの React のフックや、それを使うライブラリのフックは Server Components では使えず、Client Components でしか使えません。`'use client'` はこのモジュールがクライアント側のコードであることを示す宣言です (Day 9)。ページ全体がクライアントで描画されるわけではなく、`page.tsx` は Server Component のまま、この境界より下だけがクライアント側になります。

## initial-loading

最初の読み込み中 (まだ一度もデータが届いていない) の戻り値はどれですか?

```ts
rows: query.data?.items ?? [],
rowCount: query.data?.total ?? 0,
isPending: query.isPending,
isPlaceholderData: query.isPlaceholderData,
```

- [ ] `rows: undefined`、`rowCount: undefined`、`isPending: true`、`isPlaceholderData: false`
- [x] `rows: []`、`rowCount: 0`、`isPending: true`、`isPlaceholderData: false`
- [ ] `rows: []`、`rowCount: 0`、`isPending: false`、`isPlaceholderData: true`
- [ ] 実行時エラー (`query.data` が `undefined` なので `.items` が読めない)

> 最初は `query.data` が `undefined` なので、`?.` で `undefined` になり、`??` で `[]` / `0` になります (Day 2)。前のデータも無いので `keepPreviousData` は何も返せず、`isPending: true`、`isPlaceholderData: false` です (Day 12)。`?.` のおかげでエラーにはなりません。

## history-push

`useQueryStates(scopeParsers, { history: 'push' })` に書き換えると、何が変わりますか?

- [ ] URL が変わるたびにサーバー側 (Server Components) が再実行されるようになる
- [x] ページ送りのたびにブラウザの履歴が積まれ、「戻る」ボタンで前のページ番号に戻れるようになる
- [ ] URL の書き換えが遅くなり、デバウンスされる
- [ ] URL のキー名が `push` で始まるようになる

> `history` の既定は `'replace'` で、URL を書き換えても履歴は増えません。`'push'` にすると更新のたびに履歴が積まれ、「戻る」で前の状態に戻れます (Day 11)。サーバーの再実行は `shallow: false`、キー名の変更は `urlKeys` の役目です。

## shared-wrappers

同じ画面で次の 2 つのフックを使っています。正しい説明はどれですか?

```ts
export const useMembersQuery = () => useSharedScopeQuery('members', fetchMembers);
export const useProjectsQuery = () => useSharedScopeQuery('projects', fetchProjects);
```

- [ ] queryKey が同じになるので、メンバーとプロジェクトのデータがキャッシュで混ざる
- [ ] URL のキーも `members.page` と `projects.page` のように自動で分かれる
- [x] queryKey の先頭が違うのでキャッシュは別々だが、URL の `page` は共有されるので、片方で「次へ」を押すともう片方もページが進む
- [ ] 同じフックを 2 回呼ぶとエラーになる

> `resource` は queryKey の先頭に入るので、キャッシュは `['members', ...]` と `['projects', ...]` に分かれます (Day 12)。一方、URL のキー (`scope` / `page` / `q`) は同じパーサーで読んでいるので共有されます (Day 11)。別々にページ送りしたいなら、`urlKeys` でキー名を変えるなどの工夫が必要です (Day 14)。
