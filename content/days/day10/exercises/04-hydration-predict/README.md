---
title: hydration エラーになるのはどれ?
hints:
  - "判断のポイントは「サーバーで作った HTML」と「ブラウザでの最初の描画」が **同じになるか** です。"
  - "Server Component はブラウザで描画し直されません。`useEffect` の中身はブラウザでだけ、hydration の **後** に動きます。"
  - "`<p>` の中に `<div>` は HTML として不正です。ブラウザは HTML を読み込むときに `<p>` を途中で閉じてしまうので、React が期待する形と変わります。"
---

次の 6 つのコンポーネントを、ページを **直接開いたとき** (サーバーで HTML を作り、ブラウザで hydration するとき) に **hydration エラーが起きるか** を予想し、`main.ts` の `answers` に `true` (起きる) / `false` (起きない) で書き込んでください。

### Q1

```tsx
'use client';

export function Clock() {
  return <p>現在時刻: {new Date().toLocaleTimeString()}</p>;
}
```

### Q2

```tsx
'use client';

import { useEffect, useState } from 'react';

export function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    setNow(new Date().toLocaleTimeString());
  }, []);
  return <p>現在時刻: {now ?? '--:--:--'}</p>;
}
```

### Q3

```tsx
'use client';

export function WhereAmI() {
  const where = typeof window === 'undefined' ? 'サーバー' : 'ブラウザ';
  return <p>ここは{where}です</p>;
}
```

### Q4

```tsx
'use client';

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p>
      お知らせ:
      <div>{children}</div>
    </p>
  );
}
```

### Q5 (`app/report/page.tsx`。`'use client'` なし)

```tsx
export default async function ReportPage() {
  const rows = await getReport();
  return (
    <div>
      <p>集計時刻: {new Date().toLocaleTimeString()}</p>
      <p>{rows.length} 件</p>
    </div>
  );
}
```

### Q6

```tsx
'use client';

export function UpdatedAt() {
  return <time suppressHydrationWarning>{new Date().toLocaleTimeString()}</time>;
}
```

> 時刻は、サーバーで描画してからブラウザで描画し直すまでの間に進む (秒が変わる) ものとして考えてください。
