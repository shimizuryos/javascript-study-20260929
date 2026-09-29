import { useState } from 'react';

const SUGGESTIONS = ['React', 'TypeScript', 'Next.js'];

export function TagPicker({ initialTags }: { initialTags: string[] }) {
  const [tags, setTags] = useState(initialTags);

  const handleAdd = (tag: string) => {
    if (tags.includes(tag)) return;
    setTags([...tags, tag]);
  };

  const handleRemove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      <p>選択中: {tags.length} 件</p>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            {tag}
            <button aria-label={`${tag} を外す`} onClick={() => handleRemove(tag)}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <p>おすすめ:</p>
      {SUGGESTIONS.map((tag) => (
        <button key={tag} onClick={() => handleAdd(tag)}>
          {tag}
        </button>
      ))}
    </div>
  );
}
