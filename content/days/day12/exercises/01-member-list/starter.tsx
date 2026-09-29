'use client';

// import { useQuery } from '@tanstack/react-query';
import type { Member } from './api';
// import { fetchMembers } from './api';

export function MemberList({ teamId }: { teamId: string }) {
  // TODO: useQuery で fetchMembers(teamId) を呼ぶ (queryKey は ['members', teamId])
  const data: Member[] | undefined = undefined;
  const isPending = true;

  if (isPending) return <p>読み込み中…</p>;
  // TODO: エラーのときは「エラー: (メッセージ)」

  return (
    <ul>
      {data?.map((member) => (
        <li key={member.id}>{member.name}</li>
      ))}
    </ul>
  );
}
