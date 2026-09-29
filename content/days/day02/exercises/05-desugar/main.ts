export type User = {
  name: string;
  profile?: { nickname?: string | null; age?: number } | null;
  greet?: () => string;
};

export function nicknameOf(user: User | null | undefined): string {
  if (user === null || user === undefined) return '(なし)';
  const profile = user.profile;
  if (profile === null || profile === undefined) return '(なし)';
  const nickname = profile.nickname;
  if (nickname === null || nickname === undefined) return '(なし)';
  return nickname;
}

export function ageOf(user: User | null | undefined): number {
  if (user == null) return -1;
  const profile = user.profile;
  if (profile == null) return -1;
  const age = profile.age;
  return age == null ? -1 : age;
}

export function greetOf(user: User | null | undefined): string | undefined {
  if (user == null) return undefined;
  const greet = user.greet;
  if (greet == null) return undefined;
  return greet();
}
