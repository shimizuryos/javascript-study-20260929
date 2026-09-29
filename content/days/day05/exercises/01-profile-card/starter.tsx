import type { ReactNode } from 'react';

type AvatarProps = { name: string; size?: number };

// TODO: props を分割代入で受け取る (size の省略時は 40)
// TODO: name の 1 文字目を表示し、aria-label と style (width / height) を付ける
export function Avatar(props: AvatarProps) {
  return <span className="avatar">?</span>;
}

type ProfileCardProps = { name: string; role?: string; children?: ReactNode };

// TODO: Avatar・名前 (h2)・役割 (p.role, 省略時は 'メンバー')・children を表示する
export function ProfileCard(props: ProfileCardProps) {
  return (
    <section>
      <h2>TODO</h2>
    </section>
  );
}
