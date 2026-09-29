'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMembers } from './api';

export function MemberList({ teamId }: { teamId: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['members', teamId],
    queryFn: () => fetchMembers(teamId),
  });

  if (isPending) return <p>読み込み中…</p>;
  if (isError) return <p>エラー: {error.message}</p>;

  return (
    <ul>
      {data.map((member) => (
        <li key={member.id}>{member.name}</li>
      ))}
    </ul>
  );
}
