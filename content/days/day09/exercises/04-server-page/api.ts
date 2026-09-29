// サーバー側のデータ取得 (本物のアプリなら DB や社内 API を読むところ)
export type User = { id: string; name: string; bio: string; likes: number };

const users: User[] = [
  { id: '1', name: 'Alice', bio: 'フロントエンドエンジニア', likes: 3 },
  { id: '2', name: 'Bob', bio: 'バックエンドエンジニア', likes: 10 },
];

/** id (文字列) でユーザーを探す。見つからなければ null */
export async function getUser(id: string): Promise<User | null> {
  await new Promise((r) => setTimeout(r, 10));
  return users.find((u) => u.id === id) ?? null;
}
