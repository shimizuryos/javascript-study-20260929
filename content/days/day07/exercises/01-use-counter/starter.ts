import { useCallback, useState } from 'react';

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);

  // TODO: 続けて呼んでも正しく数えるようにする
  // TODO: useCallback で、再レンダーしても同じ関数になるようにする
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initial);

  return { count, increment, decrement, reset };
}
