import { useState } from 'react';

export const FRUITS = ['りんご', 'みかん', 'ぶどう', 'りんごジュース', 'もも'];

// TODO: state を持たず、{ value, onChange } を props で受け取る形にする
export function SearchBox() {
  const [text, setText] = useState('');
  return <input aria-label="検索" value={text} onChange={(e) => setText(e.target.value)} />;
}

export function FruitList({ query }: { query: string }) {
  const visible = FRUITS.filter((fruit) => fruit.includes(query));
  return (
    <div>
      <p>{visible.length} 件</p>
      <ul>
        {visible.map((fruit) => (
          <li key={fruit}>{fruit}</li>
        ))}
      </ul>
    </div>
  );
}

export function FilterableFruitList() {
  // TODO: 検索語の state をここに置き、SearchBox と FruitList の両方に渡す
  return (
    <div>
      <SearchBox />
      <FruitList query="" />
    </div>
  );
}
