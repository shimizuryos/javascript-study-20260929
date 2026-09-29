import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemberList } from './main';

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

/** プレビュー用: 成功するチームと、失敗するチームを並べる */
export default function Preview() {
  return (
    <QueryClientProvider client={client}>
      <h3>dev チーム</h3>
      <MemberList teamId="dev" />
      <h3>存在しないチーム</h3>
      <MemberList teamId="unknown" />
    </QueryClientProvider>
  );
}
