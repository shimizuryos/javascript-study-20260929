'use client';

import { useState } from 'react';

// クリックに反応する部分だけを Client Component にしている
export function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return (
    <button type="button" onClick={() => setLikes((n) => n + 1)}>
      ♥ {likes}
    </button>
  );
}
