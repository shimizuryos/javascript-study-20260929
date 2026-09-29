---
title: 自作フック useCounter
hints:
  - "`setCount(count + 1)` は「このレンダーの count + 1」です。1 回の操作で 2 回呼ぶと +1 にしかなりません。`setCount((c) => c + 1)` にしましょう。"
  - "`useCallback(() => setCount((c) => c + 1), [])` と書くと、関数の参照がレンダーをまたいで同じになります。関数型更新なら `count` を使わないので、依存配列は `[]` で済みます。"
  - "`reset` は `initial` を使うので、依存配列は `[initial]` です。"
---

カウンターのロジックを **自作フック** に切り出します。

```ts
const { count, increment, decrement, reset } = useCounter(10);
// count: 10 → increment() → 11 → decrement() → 10 → increment() → 11 → reset() → 10
```

- `useCounter(initial = 0)` は `{ count, increment, decrement, reset }` を返す
- `increment` / `decrement` は 1 回の処理の中で **続けて何回呼んでも** 正しく数える
- `increment` / `decrement` / `reset` は、再レンダーされても **同じ関数 (同じ参照)** のままにする

3 つ目の条件は、この関数を子コンポーネントに渡したり、依存配列に入れたりしたときに「毎回変わった」と判定されないようにするためです。

### テストの読み方

フックはコンポーネントの中でしか呼べないので、テストでは `renderHook` を使います。

```ts
const { result } = renderHook(() => useCounter(10));
result.current.count; // 最新の戻り値

act(() => result.current.increment()); // state の更新は act の中で行う
```

`act(...)` は「この中で起きた state の更新と再レンダーを、終わるまで反映させてから次に進む」ための関数です。
