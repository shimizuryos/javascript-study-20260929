---
title: props と children を受け取るカード
preview: preview.tsx
hints:
  - "props は引数の分割代入で受け取ります: `function Avatar({ name, size = 40 }: AvatarProps)`"
  - "名前の 1 文字目は `name[0]`、style は `style={{ width: size, height: size }}` のように **オブジェクト** で渡します (数値は px になります)。"
  - "`ProfileCard` では、役割のデフォルト値を `role = 'メンバー'` と書き、`{children}` と書いた場所にタグの間の中身が表示されます。"
---

プロフィールカードを 2 つのコンポーネントで作ります。完成すると「プレビュー」欄にカードが表示されます。

### 1. `Avatar({ name, size })`

名前の頭文字を丸いアイコン風に表示するコンポーネントです。

- `<span className="avatar">` の中に、`name` の **1 文字目** を表示する
- `aria-label` 属性に `name` を入れる (画面読み上げ用の名前。テストはこれで要素を探します)
- `style` で幅と高さを `size` にする。`size` は省略可能で、省略時は `40`

```tsx
<Avatar name="Alice" />
// → <span class="avatar" aria-label="Alice" style="width: 40px; height: 40px;">A</span>
```

### 2. `ProfileCard({ name, role, children })`

- 一番外側は `<section className="profile-card">`
- 中に `<Avatar name={name} />`、名前の見出し `<h2>`、役割 `<p className="role">` を並べる
- `role` は省略可能で、省略時は `'メンバー'`
- タグの間に書いたもの (`children`) を、役割の下に表示する

```tsx
<ProfileCard name="Alice" role="管理者">
  <p>React を勉強中です。</p>
</ProfileCard>
```
