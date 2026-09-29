// true: そのファイルの先頭に 'use client' が必要 / false: 不要
export const answers = {
  q1: false as unknown, // Server Component のまま (async でデータ取得。Link は Server Component でも使える)
  q2: true as unknown, // useState と onClick。Server Component から import される入口
  q3: false as unknown, // フックもイベントも無い。どちらの側からでも使える
  q4: false as unknown, // 'use client' のファイルから import されるのでクライアント側に入る
  q5: true as unknown, // error.tsx は必ず Client Component
  q6: false as unknown, // layout は Server Component のまま。Providers を import して包むだけ
  q7: true as unknown, // Context の Provider と useState を使う
  q8: true as unknown, // useRouter と onKeyDown。Server Component から import される入口
};
