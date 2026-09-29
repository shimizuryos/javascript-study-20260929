import type { ReactNode } from 'react';

type AvatarProps = { name: string; size?: number };

export function Avatar({ name, size = 40 }: AvatarProps) {
  return (
    <span className="avatar" aria-label={name} style={{ width: size, height: size }}>
      {name[0]}
    </span>
  );
}

type ProfileCardProps = { name: string; role?: string; children?: ReactNode };

export function ProfileCard({ name, role = 'メンバー', children }: ProfileCardProps) {
  return (
    <section className="profile-card">
      <Avatar name={name} />
      <h2>{name}</h2>
      <p className="role">{role}</p>
      {children}
    </section>
  );
}
