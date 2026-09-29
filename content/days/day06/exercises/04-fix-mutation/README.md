---
title: 押しても増えないバグを直す (state の直接変更)
hints:
  - "React は `Object.is(前の state, 新しい state)` で変化を判定します。`push` した配列は中身が増えても **同じ配列** です。"
  - "`useState(initialTags)` の state は、最初は親から渡された配列そのものです。それを `push` すると親の配列まで書き換わります。"
  - "`setTags([...tags, tag])` のように新しい配列を作って渡します (関数型更新 `setTags((prev) => [...prev, tag])` でも OK)。"
---

おすすめのタグをクリックして選ぶ部品です。次のバグ報告が届きました。

> おすすめタグ (「React」など) を押しても、「選択中」に何も増えない。削除ボタンは動く。

```tsx
<TagPicker initialTags={['JavaScript']} />
// 「React」を押す → 期待: 選択中が JavaScript, React の 2 件になる
```

`handleAdd` のバグを **1 か所** 直してください。さらに、親から受け取った `initialTags` の配列を書き換えないようにしてください (直し方が正しければ、自然にそうなります)。
