export type User = { id: number; name: string };

/** API が呼ばれた回数 (テストで確認するため) */
export const apiCalls = { me: 0, users: 0 };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchMe(): Promise<User> {
  apiCalls.me++;
  await sleep(10);
  return { id: 1, name: 'Alice' };
}

export async function fetchUsers(): Promise<User[]> {
  apiCalls.users++;
  await sleep(10);
  return [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
  ];
}
