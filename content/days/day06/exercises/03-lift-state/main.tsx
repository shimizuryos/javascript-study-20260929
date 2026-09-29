import { useState } from 'react';

export const FRUITS = ['りんご', 'みかん', 'ぶどう', 'りんごジュース', 'もも'];

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return <input aria-label="検索" value={value} onChange={(e) => onChange(e.target.value)} />;
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
  const [query, setQuery] = useState('');
  return (
    <div>
      <SearchBox value={query} onChange={setQuery} />
      <FruitList query={query} />
    </div>
  );
}
