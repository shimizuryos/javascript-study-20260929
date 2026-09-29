import { ProfileCard } from './main';

const css = `
.profile-card { border: 1px solid #ccc; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-family: sans-serif; }
.profile-card h2 { margin: 8px 0 4px; font-size: 18px; }
.profile-card .role { margin: 0 0 8px; color: #666; font-size: 13px; }
.avatar { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #6366f1; color: white; font-weight: bold; }
`;

export default function Preview() {
  return (
    <div>
      <style>{css}</style>
      <ProfileCard name="Alice" role="管理者">
        <p>React を勉強中です。</p>
      </ProfileCard>
      <ProfileCard name="Bob" />
    </div>
  );
}
