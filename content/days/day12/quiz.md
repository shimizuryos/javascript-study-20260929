## key-change

`filter` が `'all'` から `'done'` に変わったとき、何が起きますか?

```tsx
function TodoList({ filter }: { filter: 'all' | 'done' }) {
  const { data } = useQuery({
    queryKey: ['todos', filter],
    queryFn: () => fetchTodos(filter),
  });
  // ...
}
```

- [x] キーが `['todos', 'done']` に変わり、そのキャッシュが無ければ自動で `fetchTodos('done')` が呼ばれる
- [ ] キーは同じ `'todos'` なので何も起きない
- [ ] `['todos', 'all']` のキャッシュが `'done'` のデータで上書きされる
- [ ] `useEffect` で再取得を書かないと、データは変わらない

> queryKey は依存配列のようなものです。キーが変わると別のキャッシュを見に行き、無ければ自動で取得します。`['todos', 'all']` のキャッシュは消えずに残るので、`'all'` に戻したときはすぐ表示されます。

## missing-key

`filter` を `'all'` から `'done'` に変えたとき、画面に表示されるのはどれですか? (`'all'` のデータは取得済みとします)

```tsx
function TodoList({ filter }: { filter: 'all' | 'done' }) {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(filter),
  });
  // data を一覧で表示する
}
```

- [ ] `'done'` のデータ (queryFn の中の `filter` が変わるので)
- [x] `'all'` のデータのまま (再取得されない)
- [ ] 一瞬「読み込み中」になってから `'done'` のデータ
- [ ] エラーになる

> TanStack Query は **キーの変化** を見て再取得します。queryFn の中で使っている `filter` がキーに入っていないので、キーは `['todos']` のまま変わらず、キャッシュの `'all'` のデータが表示され続けます。queryFn で使う値はすべてキーに入れるのがルールです。

## key-hash

次の 2 つのキーについて正しいのはどれですか?

```ts
const a = ['users', { page: 1, q: 'react' }];
const b = ['users', { q: 'react', page: 1 }];
```

- [x] 同じキャッシュを指す (オブジェクトのプロパティの順番は関係ない)
- [ ] 別のキャッシュを指す (プロパティの順番が違うので)
- [ ] 別のキャッシュを指す (配列の中のオブジェクトは毎回別物なので)
- [ ] キーにオブジェクトを入れるとエラーになる

> queryKey は、中のオブジェクトのプロパティを並べ替えてから比べられる (ハッシュ化される) ので、順番が違っても同じキーです。一方、`{ page: 1 }` と `{ page: '1' }` のように値の型が違うと別のキーになります。

## flags-disabled

まだ一度も取得していないクエリが `enabled: false` のとき、フラグの組み合わせはどれですか?

```ts
const query = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => fetchProjects(userId!),
  enabled: userId !== undefined, // userId はまだ undefined
});
```

- [ ] `isPending: false`、`isFetching: false`
- [x] `isPending: true`、`isFetching: false`
- [ ] `isPending: true`、`isFetching: true`
- [ ] `isPending: false`、`isFetching: true`

> `isPending` は「まだデータが無い」、`isFetching` は「queryFn を実行中」という意味です。無効 (`enabled: false`) のクエリはデータが無いので `isPending` は `true` ですが、実行はしていないので `isFetching` (と `isLoading`) は `false` です。

## flags-placeholder

1 ページ目を表示しているときに `page` を 2 に変えました。2 ページ目のデータが **届く前** の状態として正しいのはどれですか?

```ts
const { data, isPlaceholderData, isFetching } = useQuery({
  queryKey: ['users', { page }],
  queryFn: ({ signal }) => fetchUsersPage(page, signal),
  placeholderData: keepPreviousData,
});
```

- [ ] `data` は `undefined`、`isPlaceholderData` は `false`
- [x] `data` は 1 ページ目のデータ、`isPlaceholderData` は `true`、`isFetching` は `true`
- [ ] `data` は 1 ページ目のデータ、`isPlaceholderData` は `false`、`isFetching` は `false`
- [ ] `data` は 2 ページ目のデータ、`isPlaceholderData` は `true`

> `keepPreviousData` は、新しいキーのデータが届くまで前のキーのデータを仮に表示します。このとき `isPlaceholderData` が `true`、裏では 2 ページ目を取得中なので `isFetching` も `true` です。届くと `data` が 2 ページ目になり、`isPlaceholderData` は `false` に戻ります。

## signal

目標コードの `signal` は何ですか?

```ts
queryFn: ({ signal }) => fetcher({ scope, page, q }, signal),
```

- [ ] 取得が終わったことを知らせるコールバック関数
- [x] TanStack Query が渡す AbortSignal。結果が要らなくなったときにリクエストを中断するために使う
- [ ] queryKey を文字列にしたもの
- [ ] `fetcher` が成功したかどうかを表す真偽値

> queryFn は `{ queryKey, signal, ... }` というオブジェクトを受け取ります。`signal` は AbortSignal で、`fetch(url, { signal })` のように渡しておくと、コンポーネントが消えたときなどに TanStack Query がリクエストを中断できます。`({ signal }) =>` は引数の分割代入です。

## stale-time

`staleTime: 60_000` のクエリを表示しているコンポーネントが消えて、**10 秒後** に同じキーでもう一度表示されました。何が起きますか?

```ts
useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 60_000 });
```

- [x] キャッシュのデータがすぐ表示され、queryFn は呼ばれない
- [ ] キャッシュのデータがすぐ表示され、裏で queryFn が呼ばれる
- [ ] 「読み込み中」になり、queryFn が呼ばれる
- [ ] キャッシュはコンポーネントと一緒に消えているので、エラーになる

> `staleTime` の間 (ここでは 60 秒)、データは「新しい (fresh)」とみなされ、取り直しません。既定の `staleTime: 0` なら、キャッシュをすぐ表示しつつ裏で取り直します。使われなくなったキャッシュは既定で 5 分間残るので (`gcTime`)、10 秒後ならまだあります。

## select-type

`data` の型はどれですか? (`fetchUsers` は `Promise<User[]>` を返します)

```ts
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  select: (users) => users.filter((u) => u.active).length,
});
```

- [ ] `User[] | undefined`
- [x] `number | undefined`
- [ ] `number`
- [ ] `User[]`

> `select` の戻り値が `data` になるので `number` です。ただし取得が終わるまでは `undefined` なので `number | undefined` になります。キャッシュには `select` をかける前の `User[]` が入っています。

## invalidate

`queryClient.invalidateQueries({ queryKey: ['users'] })` を実行したとき、「古い」になって取り直されるキャッシュはどれですか?

```ts
['users'];
['users', { page: 2 }];
['user', 1];
['posts', { author: 'users' }];
```

- [ ] `['users']` だけ
- [x] `['users']` と `['users', { page: 2 }]`
- [ ] 4 つすべて
- [ ] `['users']`、`['users', { page: 2 }]`、`['user', 1]`

> `invalidateQueries` は、指定したキーで **始まる** キャッシュをすべて対象にします (前方一致)。`['user', 1]` は 1 つ目の要素が `'user'` なので違います。データを変更した後 (useMutation の onSuccess など) に一覧をまとめて取り直すのによく使います。

## retry-default

テストで `new QueryClient({ defaultOptions: { queries: { retry: false } } })` と書く理由として正しいのはどれですか?

- [ ] `retry: false` にしないと queryFn が 1 回も呼ばれないから
- [x] 既定では失敗したクエリを 3 回まで (間隔を空けながら) 自動でリトライするので、エラー表示のテストが遅くなったりタイムアウトしたりするから
- [ ] 既定ではエラーを throw してテストが止まるから
- [ ] 既定ではキャッシュが無効になっているから

> TanStack Query は、失敗したクエリを既定で 3 回、少しずつ間隔を空けてリトライします。本番では一時的なネットワークエラーに強くなりますが、テストでは「エラーが表示されること」を確かめたいので、すぐ失敗するように `retry: false` にします。
