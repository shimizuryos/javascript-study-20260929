'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProjects, fetchUserByEmail } from './api';

export function UserProjects({ email }: { email: string }) {
  const userQuery = useQuery({
    queryKey: ['user', email],
    queryFn: () => fetchUserByEmail(email),
  });
  const userId = userQuery.data?.id;

  const projectsQuery = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchProjects(userId!),
    // TODO: userId が決まるまで実行しない
  });

  if (userQuery.isPending) return <p>ユーザーを読み込み中…</p>;
  if (userQuery.isError) return <p>エラー: {userQuery.error.message}</p>;

  return (
    <section>
      <h2>{userQuery.data.name} さんのプロジェクト</h2>
      {projectsQuery.isPending ? (
        <p>プロジェクトを読み込み中…</p>
      ) : (
        <ul>
          {projectsQuery.data?.map((project) => (
            <li key={project.id}>{project.title}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
