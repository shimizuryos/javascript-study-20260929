---
title: エフェクトの実行順を予想する
hints:
  - "エフェクトはレンダー (関数の実行) の **後** に動きます。依存が変わらなければ実行されません。依存配列を省略したエフェクトは毎回実行されます。"
  - "依存が変わると、「前回のクリーンアップ → 今回のエフェクト」の順です。"
  - "エフェクトの中で setState すると、エフェクトの後にもう 1 回レンダーされます。"
  - "`{ q }` はレンダーごとに新しいオブジェクトです。useMemo を使うと依存が変わらない限り同じオブジェクトになります。"
---

次のコードを実行したときの **ログ** を予想して、`main.tsx` の `answers` に書き込んでください。`log(...)` は呼ばれた順に文字列を記録する関数です。テストの `render` は Strict Mode を使わないので、エフェクトは 1 回ずつ実行されます。

### Q1〜Q3: 1 つのコンポーネント

```tsx
function Child({ id }: { id: number }) {
  log(`render ${id}`);
  useEffect(() => {
    log(`start ${id}`);
    return () => log(`stop ${id}`);
  }, [id]);
  useEffect(() => {
    log('every');
  });
  return null;
}

render(<Child id={1} />);   // Q1: ここで記録されるログ (配列)
rerender(<Child id={1} />); // Q2: 続けて、ここで記録されるログ
rerender(<Child id={2} />); // Q3: 続けて、ここで記録されるログ
```

### Q4: エフェクトの中で setState

```tsx
function Loader() {
  const [n, setN] = useState(0);
  log(`render ${n}`);
  useEffect(() => {
    setN(1);
  }, []);
  return null;
}

render(<Loader />); // Q4: 記録されるログ
```

### Q5・Q6: オブジェクトを依存配列に入れる

```tsx
function Fetcher({ q }: { q: string }) {
  const options = { q };
  useEffect(() => {
    log('fetch');
  }, [options]);
  return null;
}

function MemoFetcher({ q }: { q: string }) {
  const options = useMemo(() => ({ q }), [q]);
  useEffect(() => {
    log('fetch');
  }, [options]);
  return null;
}

// Q5: 次の 3 行で 'fetch' は合計何回記録される? (数値)
render(<Fetcher q="a" />);
rerender(<Fetcher q="a" />);
rerender(<Fetcher q="a" />);

// Q6: 次の 3 行で 'fetch' は合計何回記録される? (数値)
render(<MemoFetcher q="a" />);
rerender(<MemoFetcher q="a" />);
rerender(<MemoFetcher q="a" />);
```

Q1〜Q4 は `['render 1', ...]` のような文字列の配列、Q5・Q6 は数値で答えます。
