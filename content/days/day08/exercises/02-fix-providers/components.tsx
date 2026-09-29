import { useQuery } from '@tanstack/react-query';
import { fetchMe, fetchUsers } from './api';
import { useTheme } from './providers';

export function Header() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const theme = useTheme();
  return <header className={`header theme-${theme}`}>{me ? `ログイン中: ${me.name}` : '読み込み中…'}</header>;
}

export function UserList() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name}
          {user.id === me?.id && ' (あなた)'}
        </li>
      ))}
    </ul>
  );
}
