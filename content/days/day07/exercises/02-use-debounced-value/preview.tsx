import { useState } from 'react';
import { useDebouncedValue } from './main';

export default function Preview() {
  const [text, setText] = useState('');
  const debounced = useDebouncedValue(text, 500);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="素早く入力してみてください" />
      <p>入力中の値: {text}</p>
      <p>0.5 秒止まったら反映される値: {debounced}</p>
    </div>
  );
}
