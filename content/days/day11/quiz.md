## nullable-type

`q` の型はどれですか?

```ts
const [q, setQ] = useQueryState('q', parseAsInteger);
```

- [ ] `number`
- [x] `number | null`
- [ ] `string | null`
- [ ] `number | undefined`

> パーサーが `parseAsInteger` なので値は数値です。ただし URL に `q` が無いときや、数値に変換できないときは `null` になるので `number | null` です。`null` を消したいときは `.withDefault(...)` を付けます。

## default-invalid

URL が `/list?page=abc` のとき、`page` の値はどれですか?

```ts
const [page] = useQueryState('page', parseAsInteger.withDefault(1));
```

- [ ] `NaN`
- [ ] `null`
- [x] `1`
- [ ] `'abc'`

> `'abc'` は整数に変換できないので、パーサーは「値が無い」(`null`) と判断します。`withDefault(1)` があるので、`null` の代わりにデフォルト値の `1` が返ります。`Number('abc')` と違って `NaN` が紛れ込まないのがパーサーを使う利点です。

## clear-on-default

URL が `?page=3&q=ts` のとき、`setPage(1)` を実行した後の URL はどれですか?

```ts
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
```

- [ ] `?page=1&q=ts`
- [x] `?q=ts`
- [ ] `?page=1`
- [ ] (クエリなし)

> デフォルト値と同じ値をセットすると、キーは URL から消えます (`clearOnDefault` が既定で `true`)。関係のない `q` はそのまま残ります。値としての `page` は `1` です。

## partial-update

URL が `?scope=mine&page=3&q=react` のとき、次の行を実行した後の URL はどれですか?

```ts
const [{ scope, page, q }, setParams] = useQueryStates({
  scope: parseAsStringLiteral(['all', 'mine', 'team'] as const).withDefault('all'),
  page: parseAsInteger.withDefault(1),
  q: parseAsString,
});

setParams({ q: 'next', page: null });
```

- [x] `?scope=mine&q=next`
- [ ] `?q=next`
- [ ] `?scope=mine&page=1&q=next`
- [ ] `?scope=mine&page=null&q=next`

> `useQueryStates` の更新関数は **部分更新** です。渡さなかった `scope` はそのまま残ります。`page: null` はキーを URL から消す指定なので、`page=null` という文字列が書かれることはありません (値はデフォルトの `1` になります)。

## computed-key

次のコードで、ページ番号を読み書きする URL のクエリ名と、値の取り出し方の組み合わせはどれですか?

```ts
const KEYS = { page: 'p' } as const;

const parsers = {
  [KEYS.page]: parseAsInteger.withDefault(1),
};

const [values, setValues] = useQueryStates(parsers);
```

- [ ] URL は `?page=2`、値は `values.page`
- [x] URL は `?p=2`、値は `values.p`
- [ ] URL は `?p=2`、値は `values.page`
- [ ] URL は `?KEYS.page=2`、値は `values.KEYS`

> `[KEYS.page]` は計算されたキーで、`KEYS.page` の **値** (`'p'`) がキーになります。つまり `parsers` は `{ p: ... }` と同じです。`useQueryStates` はオブジェクトのキーをそのままクエリ名に使うので、URL は `?p=2`、値は `values.p` です。目標コードは名前と値が同じ (`page: 'page'`) なので、この違いが見えにくくなっています。

## text-or-null

目標コードの `setSearch` が `q: text` ではなく `q: text || null` と書いている理由として正しいのはどれですか?

```ts
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

- [ ] `text` が `undefined` のときにエラーにならないようにするため
- [x] 検索欄が空になったとき、`?q=` という空のクエリを残さずキーごと消すため
- [ ] `text` を数値に変換するため
- [ ] `q` の型を `string` にするため

> `parseAsString` に空文字 `''` をセットすると、`?q=` という「値が空のクエリ」が URL に残ります。`''` は falsy なので、`text || null` は空文字のとき `null` になり、キーごと消えます (Day 2 の `||`)。

## history-push

ユーザーが 1 ページ目 (URL に `page` が無い状態) で「次へ」を 2 回押して `?page=3` にしたあと、ブラウザの「戻る」を押しました。表示されるのは何ページ目ですか?

```ts
const [page, setPage] = useQueryState(
  'page',
  parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
);
// 「次へ」ボタン: onClick={() => setPage((p) => p + 1)}
```

- [ ] 1 ページ目
- [x] 2 ページ目
- [ ] 3 ページ目 (URL は変わらない)
- [ ] この画面を開く前のページに戻る

> `history: 'push'` なので、更新のたびに履歴が 1 つ積まれます (`?page=2` → `?page=3`)。「戻る」で 1 つ前の `?page=2` に戻ります。既定の `'replace'` なら履歴は積まれず、「戻る」でこの画面を開く前のページに戻ります。

## infer-parser-type

`Params` の型はどれですか?

```ts
const parsers = {
  a: parseAsInteger,
  b: parseAsBoolean.withDefault(false),
};

type Params = inferParserType<typeof parsers>;
```

- [ ] `{ a: number; b: boolean }`
- [x] `{ a: number | null; b: boolean }`
- [ ] `{ a: number | null; b: boolean | null }`
- [ ] `{ a: string; b: string }`

> `inferParserType` は、`useQueryStates(parsers)` が返す値の型を取り出します。`withDefault` が無い `a` は `null` になりうるので `number | null`、デフォルト値がある `b` は `boolean` です。

## adapter-place

Next.js (App Router) のアプリで `useQueryState` を使えるようにするとき、`NuqsAdapter` を置く場所として正しいのはどれですか?

- [ ] `useQueryState` を呼ぶコンポーネントの中で毎回 `<NuqsAdapter>` を返す
- [x] ルートレイアウト (`app/layout.tsx`) などで、アプリ全体を `<NuqsAdapter>` で囲む
- [ ] `next.config.ts` に `nuqs: true` と書く
- [ ] 何もしなくてよい (nuqs は自動で Next.js を検出する)

> nuqs はアダプター (Context の Provider) から「URL の読み書きの方法」を受け取ります。Day 8〜9 の Provider と同じく、アプリの上の方で 1 回囲めば、その下のどこでもフックが使えます。テストでは代わりに `NuqsTestingAdapter` で囲みます。

## serializer

`createSerializer` はパーサーを使って URL の文字列を作る関数を返します (リンクの `href` を作るときなどに使います)。`url` の値はどれですか?

```ts
import { createSerializer, parseAsInteger, parseAsString } from 'nuqs';

const serialize = createSerializer({
  page: parseAsInteger.withDefault(1),
  q: parseAsString,
});

const url = serialize('/users', { page: 1, q: 'ts' });
```

- [ ] `'/users?page=1&q=ts'`
- [x] `'/users?q=ts'`
- [ ] `'/users?page=1'`
- [ ] `'?page=1&q=ts'`

> シリアライザーもフックと同じルールで URL を作ります。`page` の `1` はデフォルト値なので書かれません (clearOnDefault)。第 1 引数に渡したパス `/users` の後ろにクエリが付きます。
