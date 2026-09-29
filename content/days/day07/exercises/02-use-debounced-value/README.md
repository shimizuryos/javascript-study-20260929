---
title: 自作フック useDebouncedValue
preview: preview.tsx
hints:
  - "返す値は state で持ちます: `const [debounced, setDebounced] = useState(value);`"
  - "エフェクトの中で `setTimeout(() => setDebounced(value), delayMs)` し、依存配列は `[value, delayMs]` です。"
  - "クリーンアップで `clearTimeout` しないと、途中の値のタイマーが残って、途中の値が一瞬反映されてしまいます。"
---

検索欄に 1 文字打つたびに通信すると、サーバーに負担がかかります。そこで「**入力が `delayMs` ミリ秒止まったら** 値を反映する」フック (デバウンス) を作ります。プレビュー欄で動きを確かめられます。

```ts
const debouncedQuery = useDebouncedValue(query, 300);
// query:          'r' → 're' → 'rea' → 'reac' → 'react' (素早く入力)
// debouncedQuery: ''  → ''   → ''    → ''     → ''  … 300ms 止まる … → 'react'
```

- 最初は、渡された `value` をそのまま返す
- `value` が変わっても **すぐには変わらない**。`delayMs` ミリ秒たったら新しい値になる
- `delayMs` 以内に `value` がまた変わったら、タイマーをやり直す (途中の値は一度も返さない)

`useEffect` のタイマーとクリーンアップ (`clearTimeout`) を使います。テストは本物の時間 (100ms 程度) で待つので、実行に少し時間がかかります。
