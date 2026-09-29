import { useState } from 'react';

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);

  const increment = () => setCount((c) => c + 1);

  const addThree = () => {
    increment();
    increment();
    increment();
  };

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={addThree}>+3</button>
      <button onClick={() => setCount((c) => c - 1)} disabled={count <= 0}>
        -1
      </button>
      <button onClick={() => setCount(initial)}>リセット</button>
    </div>
  );
}
