## params-promise

Next.js 16 のプロジェクトで `/users/42` を開きました。このコードの問題はどれですか?

```tsx
// app/users/[id]/page.tsx
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const id = params.id;
  return <h1>ユーザー {id}</h1>;
}
```

- [ ] 問題ない。`id` は `'42'` になる
- [ ] 問題ない。`id` は数値の `42` になる
- [x] `params` は Promise なので `params.id` は `undefined` (TypeScript も型エラーにする)。`const { id } = await params;` と書く
- [ ] `async` を外せば `params.id` で読める

> Next.js 15 から `params` / `searchParams` は Promise です。Promise オブジェクトに `id` というプロパティは無いので `undefined` になります。16 では同期的な読み方が完全に廃止されたので、`await` (Client Component なら `use()`) が必須です。

## search-params-shape

`/shop?tag=a&tag=b&page=2` を開いたとき、次のコードの `tag`, `page`, `q` の値はどれですか?

```tsx
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tag, page, q } = await searchParams;
  // ...
}
```

- [ ] `tag = 'a'`, `page = 2`, `q = null`
- [x] `tag = ['a', 'b']`, `page = '2'`, `q = undefined`
- [ ] `tag = 'b'`, `page = '2'`, `q = ''`
- [ ] `tag = ['a', 'b']`, `page = 2`, `q = undefined`

> 同じキーが複数あると **配列**、1 つなら **文字列** (数字でも文字列のまま)、無ければ **`undefined`** です。だから型は `string | string[] | undefined` になっています。

## get-returns-null

URL が `/shop?page=2` のとき、Client Component での `q` の値はどれですか?

```tsx
'use client';
const searchParams = useSearchParams();
const q = searchParams.get('q');
```

- [ ] `undefined`
- [x] `null`
- [ ] `''`
- [ ] エラーになる

> `URLSearchParams` の `get()` は、キーが無いと `null` を返します (`?q=` のように値が空なら `''`)。サーバー側の `searchParams` オブジェクトでは無いキーは `undefined` なので、両者の違いに注意します。

## number-nan

`/shop?page=abc` を開いたとき、`page` の値はどれですか?

```ts
const sp = await searchParams; // { page: 'abc' }
const page = Number(sp.page ?? '1');
```

- [ ] `1`
- [ ] `0`
- [x] `NaN`
- [ ] `'abc'`

> `sp.page` は `'abc'` (undefined ではない) なので `??` の右側は使われず、`Number('abc')` は `NaN` になります。URL は自由に書き換えられるので、`Number.isInteger(n) && n >= 1 ? n : 1` のように **範囲まで確認** してから使います。

## readonly-search-params

Client Component で次のように書くと実行時エラーになりました。正しい直し方はどれですか?

```tsx
const searchParams = useSearchParams();
const router = useRouter();

function goToPage(page: number) {
  searchParams.set('page', String(page));
  router.push(`/products?${searchParams}`);
}
```

- [ ] `useSearchParams` を `useState` に入れてから `set` する
- [x] `const params = new URLSearchParams(searchParams);` でコピーしてから `params.set(...)` する
- [ ] `searchParams.page = String(page)` と代入する
- [ ] `useSearchParams` を `useSearchParams(true)` にして書き込み可能にする

> `useSearchParams()` が返すのは **読み取り専用** の `URLSearchParams` です。`new URLSearchParams(searchParams)` (または `new URLSearchParams(searchParams.toString())`) でコピーを作ると自由に変更できます。

## url-after-update

今の URL が `/products?q=shoe&page=3` のとき、`changeSort('new')` を呼んだ後の URL はどれですか?

```tsx
const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();

function changeSort(sort: string) {
  const params = new URLSearchParams(searchParams);
  params.set('sort', sort);
  params.delete('page');
  router.push(`${pathname}?${params}`);
}
```

- [ ] `/products?sort=new`
- [x] `/products?q=shoe&sort=new`
- [ ] `/products?q=shoe&page=3&sort=new`
- [ ] `?q=shoe&sort=new` (パスが消える)

> コピーした `params` には元の `q` と `page` が入っています。`sort` を追加して `page` を消すので `q=shoe&sort=new` が残ります。「他のクエリを残したまま一部だけ変える」ための定番の書き方です。

## push-or-replace

検索欄に入力するたびに `?q=...` を更新する部品を作ります。`router.push` ではなく `router.replace` を使う理由として正しいのはどれですか?

- [ ] `replace` の方が速く、サーバーへのリクエストが減るから
- [x] `push` だと 1 文字ごとに履歴が増え、「戻る」を何度も押さないと前の画面に戻れないから
- [ ] `push` は Server Component でしか使えないから
- [ ] `replace` を使うと URL が変わらないので、再描画が起きないから

> `push` は履歴を 1 つ増やし、`replace` は今の履歴を置き換えます。どちらも URL は変わり、画面も更新されます。入力中の細かい変化は `replace`、ページ送りのように「戻る」で戻りたい移動は `push` が向いています。

## suspense-boundary

静的にレンダリングされるページで、`useSearchParams()` を使う `<SearchBox>` を `<Suspense>` で囲む理由として正しいのはどれですか?

```tsx
<Suspense fallback={<p>読み込み中…</p>}>
  <SearchBox />
</Suspense>
```

- [ ] `useSearchParams()` は Promise を返すので、`await` の代わりに `Suspense` が必要だから
- [x] ビルド時には URL のクエリが分からないので、その部分はブラウザで描画される。境界が無いと本番ビルドがエラーになるから
- [ ] `Suspense` で囲むと `SearchBox` が Server Component になるから
- [ ] 開発サーバーで警告が出るのを消すためだけで、本番には影響しないから

> 静的なページは **ビルド時** に HTML を作りますが、そのときユーザーの `?q=...` はまだ分かりません。`useSearchParams()` を使う部品は、一番近い `<Suspense>` 境界まで「ブラウザで描画する」扱いになり、境界が無いと本番ビルドが失敗します。開発サーバーでは動いてしまうので気づきにくい点に注意します。

## hydration-server-vs-client

次の 2 つのうち、**hydration エラーになる** のはどれですか?

```tsx
// A: app/page.tsx ('use client' なし)
export default function Page() {
  return <p>生成時刻: {new Date().toLocaleTimeString()}</p>;
}

// B: app/clock.tsx
'use client';
export function Clock() {
  return <p>現在時刻: {new Date().toLocaleTimeString()}</p>;
}
```

- [ ] A だけ
- [x] B だけ
- [ ] A と B の両方
- [ ] どちらもならない

> Client Component (B) はサーバーで HTML を作った後、ブラウザでもう一度描画されます。その間に時刻が進むので、HTML と中身が合わずエラーになります。Server Component (A) はブラウザで描画し直されないので、不一致は起きません。

## server-snapshot

次のコードで、サーバーでの描画と **hydration 中** に使われる値はどれですか? (ブラウザの localStorage には `theme = 'dark'` が保存されているとします)

```tsx
const theme = useSyncExternalStore(
  subscribe,
  () => localStorage.getItem('theme') ?? 'light',
  () => 'light',
);
```

- [ ] サーバーでは `'light'`、hydration 中は `'dark'`
- [x] サーバーでも hydration 中も `'light'` (hydration の後に `'dark'` で描画し直される)
- [ ] サーバーでも hydration 中も `'dark'`
- [ ] サーバーではエラーになる

> 3 つ目の引数 `getServerSnapshot` は、サーバーでの描画と hydration 中に使われます。これでサーバーの HTML とブラウザの最初の描画が一致し、hydration が終わってから本当の値 (`'dark'`) で描画し直されます。
