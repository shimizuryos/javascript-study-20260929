// true: hydration エラーが起きる / false: 起きない
export const answers = {
  q1: true as unknown, // Client Component のレンダー中に時刻を作っている。サーバーとブラウザで値が変わる
  q2: false as unknown, // サーバーと最初の描画はどちらも '--:--:--'。時刻は hydration の後に useEffect で入る
  q3: true as unknown, // サーバーでは 'サーバー'、ブラウザでは 'ブラウザ' を描画してしまう
  q4: true as unknown, // <p> の中の <div> はブラウザが HTML を読むときに組み替えてしまい、形が合わない
  q5: false as unknown, // Server Component はブラウザで描画し直されないので、不一致は起きない
  q6: false as unknown, // suppressHydrationWarning でその要素のテキストの不一致を許している
};
