---
title: "(発展) ?. と ?? を使わずに書き直す"
optional: true
hints:
  - "`a?.b` は「`a` が `null` か `undefined` なら `undefined`、そうでなければ `a.b`」です。`if` で 1 段ずつ確認します。"
  - "`x === null || x === undefined` は `x == null` とも書けます (`==` は `null` と `undefined` だけを同じとみなす特別なルールがあります)。"
  - "`if (!nickname)` のような truthy チェックにすると、`''` や `0` まで「無い」扱いになってテストに落ちます。"
---

`main.ts` の 3 つの関数は `?.` と `??` を使って 1 行で書かれています。これを **`?.` と `??` を使わずに**、`if` などで同じ動きになるように書き直してください (展開 = de-sugar)。

```ts
export const nicknameOf = (user: User | null | undefined) => user?.profile?.nickname ?? '(なし)';
export const ageOf = (user: User | null | undefined) => user?.profile?.age ?? -1;
export const greetOf = (user: User | null | undefined) => user?.greet?.();
```

書き直すと、`?.` と `??` が「`null` と `undefined` **だけ**」を特別扱いしていることが実感できます。たとえば次の結果は変わってはいけません。

```ts
nicknameOf({ name: 'A', profile: { nickname: '' } }); // ''   ← 空文字はそのまま
ageOf({ name: 'A', profile: { age: 0 } }); // 0            ← 0 もそのまま
greetOf({ name: 'A' }); // undefined                       ← greet が無ければ呼ばない
```

テストでは、関数のソースコード (コメントを除く) に `?.` と `??` が含まれていないことも確認します。
