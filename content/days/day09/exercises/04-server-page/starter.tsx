import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from './api';
import { LikeButton } from './like-button';

type Props = { params: Promise<{ id: string }> };

// TODO:
//   1. async 関数にする
//   2. params を await して id を取り出す
//   3. getUser(id) でユーザーを取得し、見つからなければ notFound() を呼ぶ
//   4. 名前・自己紹介・LikeButton・一覧へ戻るリンクを表示する
export default function UserPage({ params }: Props) {
  return (
    <article>
      <h1>TODO</h1>
    </article>
  );
}
