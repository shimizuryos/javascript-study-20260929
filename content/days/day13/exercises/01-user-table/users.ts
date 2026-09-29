export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'member';
};

export const USERS: User[] = [
  { id: 1, firstName: '太郎', lastName: '山田', email: 'taro@example.com', role: 'admin' },
  { id: 2, firstName: '花子', lastName: '佐藤', email: 'hanako@example.com', role: 'member' },
  { id: 3, firstName: '次郎', lastName: '鈴木', email: 'jiro@example.com', role: 'member' },
  { id: 4, firstName: '三郎', lastName: '高橋', email: 'saburo@example.com', role: 'admin' },
];
