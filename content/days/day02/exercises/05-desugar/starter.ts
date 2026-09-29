export type User = {
  name: string;
  profile?: { nickname?: string | null; age?: number } | null;
  greet?: () => string;
};

// TODO: 3 つとも ?. と ?? を使わずに、同じ動きになるように書き直す

export const nicknameOf = (user: User | null | undefined) => user?.profile?.nickname ?? '(なし)';

export const ageOf = (user: User | null | undefined) => user?.profile?.age ?? -1;

export const greetOf = (user: User | null | undefined) => user?.greet?.();
