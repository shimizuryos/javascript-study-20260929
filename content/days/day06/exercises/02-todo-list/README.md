---
title: Todo リストをイミュータブルに更新する
preview: preview.tsx
hints:
  - "追加は `[...todos, 新しい todo]`、削除は `todos.filter((t) => t.id !== id)` で **新しい配列** を返します。"
  - "反転は `todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))`。対象以外の要素は **同じオブジェクトのまま** 返します。"
  - "新しい id は `Math.max(0, ...todos.map((t) => t.id)) + 1` で作れます (空配列なら 1)。"
  - "入力欄は `value={text}` と `onChange={(e) => setText(e.target.value)}` をセットで書きます。"
---

Todo リストを作ります。state の更新ロジックは、テストしやすいように **普通の関数** に切り出してあります。

### 1. 3 つの関数 (元の配列・オブジェクトを変更しないこと)

```ts
type Todo = { id: number; text: string; done: boolean };

addTodo(todos, '牛乳を買う'); // 末尾に { id: 最大の id + 1, text, done: false } を足した新しい配列
toggleTodo(todos, 2); // id が 2 の done を反転した新しい配列 (ほかの要素は同じオブジェクトのまま)
removeTodo(todos, 2); // id が 2 を取り除いた新しい配列
```

### 2. `TodoApp` の入力欄

`TodoApp` の画面はほぼできています。入力欄 (`aria-label="新しいタスク"`) を **制御された入力** (`value` + `onChange`) にしてください。

- 「追加」を押すと、入力した文字でタスクが追加され、入力欄は空になる
- 空白だけのときは追加しない
- チェックボックスで完了を切り替えると、「残り N 件」が変わる
