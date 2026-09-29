import { UserTable } from './main';
import { USERS } from './users';

/** プレビュー用: 見やすいように枠線を付けて表示する */
export default function Preview() {
  return (
    <div>
      <style>{'table { border-collapse: collapse; } th, td { border: 1px solid #999; padding: 4px 8px; }'}</style>
      <UserTable users={USERS} />
    </div>
  );
}
