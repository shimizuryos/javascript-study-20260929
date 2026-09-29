---
title: useQuery で一覧を表示する
preview: preview.tsx
hints:
  - "`const { data, isPending, isError, error } = useQuery({ queryKey: ['members', teamId], queryFn: () => fetchMembers(teamId) });`"
  - "`if (isPending) return ...;` → `if (isError) return ...;` の順に先に return すると、最後の行では `data` が必ずある (undefined でない) と TypeScript が判断してくれます。"
  - "エラーメッセージは `error.message` です。"
---

チームのメンバー一覧を表示する `MemberList` を、`useQuery` を使って完成させてください。データは `api.ts` の `fetchMembers(teamId)` で取得します (少し待ってから結果を返す、疑似的な API です)。

| 状態 | 表示 |
| --- | --- |
| 取得中 | `<p>読み込み中…</p>` |
| 失敗 | `<p>エラー: (エラーメッセージ)</p>` |
| 成功 | `<ul>` にメンバーの名前を `<li>` で並べる |

- queryKey は `['members', teamId]` にします
- `fetchMembers('unknown')` のように存在しないチームを指定すると、`Error('チーム unknown が見つかりません')` を throw します

最後のテストでは、同じチームの `MemberList` を 2 つ並べても `fetchMembers` は **1 回しか呼ばれない** ことを確かめます。同じキーのデータはキャッシュで共有されるからです。
