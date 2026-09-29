import { getAllDayMeta, getTargetCode } from '@/lib/content';
import { Dashboard } from '@/components/dashboard/dashboard';

export default async function HomePage() {
  const metas = getAllDayMeta();
  const target = await getTargetCode();
  return <Dashboard metas={metas} target={target} />;
}
