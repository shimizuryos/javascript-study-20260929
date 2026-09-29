---
title: どの値が届くか予想する
hints:
  - "useContext は、自分より上にある **一番近い** Provider の値を読みます。上に 1 つも無いときだけデフォルト値です。"
  - "Provider が値を届けるのは子孫だけです。兄弟や、Provider の外に置いたものには届きません。"
  - "Provider が **ある** なら、value が `undefined` でもその値 (`undefined`) が使われます。デフォルト値にはなりません。"
---

次のコードを表示したときの **画面のテキスト全体** を予想して、`main.tsx` の `answers` に文字列で書き込んでください。

```tsx
const ThemeContext = createContext<string | undefined>('light');

function Label() {
  const theme = useContext(ThemeContext);
  return <span>[{theme}]</span>;
}
```

`[{theme}]` なので、theme が `'dark'` なら `[dark]`、`undefined` なら `[]` と表示されます。

```tsx
// Q1
<Label />

// Q2
<ThemeContext value="dark">
  <Label />
  <ThemeContext value="blue">
    <Label />
  </ThemeContext>
  <Label />
</ThemeContext>

// Q3
<>
  <ThemeContext value="dark">
    <Label />
  </ThemeContext>
  <Label />
</>

// Q4
<ThemeContext.Provider value="green">
  <div>
    <section>
      <Label />
    </section>
  </div>
</ThemeContext.Provider>

// Q5
<ThemeContext value={undefined}>
  <Label />
</ThemeContext>

// Q6
function DarkSection({ children }: { children: ReactNode }) {
  return <ThemeContext value="dark">{children}</ThemeContext>;
}

<ThemeContext value="blue">
  <DarkSection>
    <Label />
  </DarkSection>
  <Label />
</ThemeContext>
```

例: `[light][dark]` のように、表示される順につなげて書きます。
