---
title: "?. と ?? と || の結果を予想する"
hints:
  - "`?.` は左側が `null` / `undefined` なら、その先を評価せずに **`undefined`** を返します (`null` ではありません)。"
  - "`??` は左が `null` / `undefined` のときだけ右を使います。`||` は `0` や `''` でも右を使います。"
  - "空配列 `[]` の `[0]` は `undefined` です。"
---

**コードを読む力** をつける問題です。次のコードを実行したときの値を **予想して**、`main.ts` の `answers` に書き込んでください。

```ts
type Res = {
  data?: { items: string[]; total: number };
  error: { message: string } | null;
};
const loaded: Res = { data: { items: [], total: 0 }, error: null }; // 読み込み完了 (0 件)
const loading: Res = { error: null }; // 読み込み中 (data がまだ無い)

const q1 = loaded.data?.total || 10;
const q2 = loaded.data?.total ?? 10;
const q3 = loading.data?.items ?? ['なし'];
const q4 = loading.data?.items.length;
const q5 = loaded.error?.message;

const text = '';
const q6 = [text || 'なし', text ?? 'なし'];

const handlers: { onDone?: () => string } = {};
const q7 = handlers.onDone?.() ?? '未登録';

const q8 = loaded.data?.items?.[0] ?? '(空)';
```

答えが `undefined` のときは `undefined`、配列のときは `[...]` をそのまま書きます。間違えた問題は、レッスンの表と「落とし穴」で確認しましょう。
