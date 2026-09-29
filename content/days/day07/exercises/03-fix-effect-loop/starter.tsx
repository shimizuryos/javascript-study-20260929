import { useEffect, useMemo, useState } from 'react';

export type SearchOptions = { q: string; limit: number };

type Props = {
  q: string;
  search: (options: SearchOptions) => Promise<string[]>;
};

export function SearchResults({ q, search }: Props) {
  const [items, setItems] = useState<string[]>([]);

  const options = { q, limit: 10 };

  useEffect(() => {
    let ignore = false;
    search(options).then((result) => {
      if (!ignore) setItems(result);
    });
    return () => {
      ignore = true;
    };
  }, [options, search]);

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
