import { useState } from 'react';

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);

  const increment = () => setCount(count + 1);

  // +3 は increment を 3 回呼ぶ (このままでは 1 しか増えない)
  const addThree = () => {
    increment();
    increment();
    increment();
  };

  // TODO: 「-1」ボタン (count が 0 以下なら disabled) と「リセット」ボタン (initial に戻す) を追加する
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={addThree}>+3</button>
    </div>
  );
}
