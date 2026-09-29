---
title: "(発展) 非同期処理の順番を予想する"
optional: true
hints:
  - "`async` 関数を呼ぶと、最初の `await` までは **すぐに (同期的に)** 実行されます。`await` の続きは、今の処理が全部終わってから動きます。"
  - "`async` 関数は必ず Promise を返します。Promise はオブジェクトです。"
  - "`Promise.all` には Promise でない値を混ぜてもよく、そのまま結果に入ります。`await` した Promise が失敗すると、その行で例外が投げられます。"
---

次のコードを実行したときの値を **予想して**、`main.ts` の `answers` に書き込んでください。

```ts
const log: string[] = [];

async function task(name: string) {
  log.push(`${name}: start`);
  await Promise.resolve();
  log.push(`${name}: end`);
  return name.toUpperCase();
}

log.push('A');
const p = task('t');
log.push('B');
// Q1: この時点での log の中身は?
// Q2: この時点での typeof p は?

const r = await p;
// Q3: この時点での log の中身は?
// Q4: r の値は?

const values = await Promise.all([Promise.resolve(1), 2, task('x')]);
// Q5: values の値は?

async function safe() {
  try {
    await Promise.reject(new Error('NG'));
    return 'ok';
  } catch (e) {
    return e instanceof Error ? e.message : '不明なエラー';
  }
}
const message = await safe();
// Q6: message の値は?
```

`typeof` の答えは `'number'` のような文字列で、配列は `[...]` で書きます。
