import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from './api';
import { LikeButton } from './like-button';

type Props = { params: Promise<{ id: string }> };

export default async function UserPage({ params }: Props) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  return (
    <article>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <LikeButton initialLikes={user.likes} />
      <Link href="/users">一覧へ戻る</Link>
    </article>
  );
}
