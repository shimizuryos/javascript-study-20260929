## exam-zero-render

`<Results items={[]} />` を表示すると、画面には何が出ますか?

```tsx
function Results({ items }: { items: string[] }) {
  return (
    <div>
      {items.length && (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] 何も表示されない
- [x] `0`
- [ ] 空の `<ul>` だけが表示される
- [ ] `false`

> `items.length` が `0` なので、`0 && ...` の結果は `0` です。数値の 0 は画面に表示されます。`items.length > 0 && ...` と書くのが正解です。

## exam-key-choice

一覧は「名前順」「登録日順」に並べ替えられ、行の中にはチェックボックスがあります。`key` に最も適切なものはどれですか? (`id` はユーザーごとに一意)

```tsx
{users.map((user, index) => (
  <UserRow key={???} user={user} />
))}
```

- [ ] `index`
- [x] `user.id`
- [ ] `Math.random()`
- [ ] `user.name`

> key は、並べ替えても同じ項目なら同じ値である必要があります。`index` は並べ替えると項目との対応がずれ、チェック状態が別の行に移ってしまいます。`Math.random()` は毎回変わるので毎回作り直され、`user.name` は同名の人がいると重複します。

## exam-children

次の JSX を表示したときの、画面のテキスト全体 (`textContent`) はどれですか?

```tsx
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

<Panel title="設定">
  <p>A</p>
  <p>B</p>
</Panel>;
```

- [x] `設定AB`
- [ ] `AB設定`
- [ ] `設定`
- [ ] `titlechildren`

> タグの間に書いた `<p>A</p><p>B</p>` は `children` として渡され、`{children}` を書いた場所 (h2 の後) に表示されます。

## exam-snapshot

`page` が 1 のときにボタンを 1 回押すと、次の表示で page はいくつになりますか?

```tsx
const [page, setPage] = useState(1);

const handleNext = () => {
  setPage(page + 1);
  setPage(page + 1);
};
```

- [ ] 1
- [x] 2
- [ ] 3
- [ ] 4

> このレンダーの `page` は 1 で固定なので、2 回とも `setPage(2)` です。2 回進めたいなら `setPage((p) => p + 1)` を 2 回呼びます。

## exam-functional

`x` が 3 のときにボタンを 1 回押すと、次の表示で x はいくつになりますか?

```tsx
const handleClick = () => {
  setX((x) => x * 2);
  setX((x) => x * 2);
};
```

- [ ] 6
- [x] 12
- [ ] 9
- [ ] 3

> 関数型更新は、直前の結果を引数にして順番に処理されます。3 → 6 → 12 です。

## exam-immutable

`tags` (文字列の配列の state) に `tag` を追加して、正しく再レンダーされるのはどれですか?

- [ ] `tags.push(tag); setTags(tags);`
- [x] `setTags([...tags, tag]);`
- [ ] `setTags(tags.push(tag));`
- [ ] `tags[tags.length] = tag; setTags(tags);`

> React は `Object.is(前の state, 新しい state)` で変化を判定するので、新しい配列を渡す必要があります。`push` や添字への代入は元の配列を書き換えるだけで参照は同じです。`tags.push(tag)` の戻り値は新しい長さ (数値) なので、3 つ目は state が数値になってしまいます。

## exam-effect-order

`roomId` が `'a'` で表示され、`'b'` に変わり、その後コンポーネントが画面から消えました。ログの順番として正しいものはどれですか?

```tsx
useEffect(() => {
  console.log(`subscribe ${roomId}`);
  return () => console.log(`unsubscribe ${roomId}`);
}, [roomId]);
```

- [x] `subscribe a` → `unsubscribe a` → `subscribe b` → `unsubscribe b`
- [ ] `subscribe a` → `subscribe b` → `unsubscribe a` → `unsubscribe b`
- [ ] `subscribe a` → `unsubscribe b` → `subscribe b` → `unsubscribe b`
- [ ] `subscribe a` → `subscribe b` → `unsubscribe b`

> 依存が変わると「前回のクリーンアップ (前回の値のまま) → 新しいエフェクト」の順で実行されます。アンマウント時は最後のエフェクトのクリーンアップだけが実行されます。

## exam-object-deps

親が `scope` と `page` を **変えずに** 何度も再レンダーすると、`sendLog` はどうなりますか?

```tsx
function Tracker({ scope, page }: { scope: string; page: number }) {
  const params = { scope, page };
  useEffect(() => {
    sendLog(params);
  }, [params]);
  return null;
}
```

- [ ] 最初の 1 回だけ呼ばれる
- [x] 再レンダーのたびに呼ばれる
- [ ] 一度も呼ばれない
- [ ] scope か page が変わったときだけ呼ばれる

> `params` はレンダーのたびに新しいオブジェクトなので、依存配列の比較 (`Object.is`) で毎回「変わった」と判定されます。依存配列を `[scope, page]` にしてオブジェクトはエフェクトの中で作るか、`useMemo(() => ({ scope, page }), [scope, page])` にします。

## exam-usememo-page

目標コード 46 行目です。`pageSize` は 20 のまま、`page` が 3 から 4 に変わりました。`pagination` はどうなりますか?

```ts
const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);
```

- [ ] 前回と同じオブジェクト `{ pageIndex: 2, pageSize: 20 }` のまま
- [x] 新しいオブジェクト `{ pageIndex: 3, pageSize: 20 }` になる
- [ ] 新しいオブジェクト `{ pageIndex: 4, pageSize: 20 }` になる
- [ ] 前回のオブジェクトの `pageIndex` が 3 に書き換えられる

> 依存の `page` が変わったので、useMemo は関数を呼び直して新しいオブジェクトを作ります。pageIndex は 0 始まりなので 4 - 1 = 3 です。useMemo は前の値を書き換えるのではなく、新しい値を作り直します。

## exam-hook-rules

次の自作フックの問題点として正しいものはどれですか?

```tsx
function useUserName(id: string | null) {
  if (id === null) return '';
  const [name, setName] = useState('');
  // ... id から名前を取得して setName する
  return name;
}
```

- [ ] 名前が `use` で始まっているので、コンポーネントからは呼べない
- [x] `id` が null かどうかで `useState` を呼ぶ回数が変わる (フックのルール違反)
- [ ] 自作フックの中では `useState` を使えない
- [ ] 戻り値が文字列なので、フックとして使えない

> フックはトップレベルで、毎回同じ順番・同じ回数だけ呼ぶ必要があります。早期 return の後にフックがあると、id が null → 文字列に変わったときに `Rendered more hooks than during the previous render.` エラーになります。`useState` を先に呼び、条件分岐はその後に書きます。

## exam-context-nearest

`LocaleContext` のデフォルト値は `'fr'` です。`Header` / `Main` / `Footer` がそれぞれ `useContext(LocaleContext)` の値を表示するとき、表示はどうなりますか?

```tsx
<>
  <LocaleContext value="en">
    <Header />
    <LocaleContext value="ja">
      <Main />
    </LocaleContext>
  </LocaleContext>
  <Footer />
</>
```

- [ ] Header: `en` / Main: `en` / Footer: `en`
- [x] Header: `en` / Main: `ja` / Footer: `fr`
- [ ] Header: `en` / Main: `ja` / Footer: `ja`
- [ ] Header: `fr` / Main: `ja` / Footer: `en`

> useContext は一番近い上の Provider の値を読みます。Main は内側の `ja`、Header は外側の `en` です。Footer は Provider の外 (兄弟) なので、デフォルト値の `fr` になります。

## exam-provider-placement

ルートの layout が次のようになっています。`Toolbar` と各ページ (`children`) の中で `useQuery` を使っているとき、`No QueryClient set, use QueryClientProvider to set one` のエラーが出るのはどれですか? (`Providers` の中に QueryClientProvider があります)

```tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Toolbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [x] `Toolbar` だけ
- [ ] 各ページだけ
- [ ] 両方
- [ ] どちらもエラーにならない

> Provider の値は、Provider で包んだ子孫にしか届きません。`Toolbar` は `Providers` の兄弟なので QueryClient を受け取れず、エラーになります。`<Providers>` で `Toolbar` も含めて包むのが正解です。
