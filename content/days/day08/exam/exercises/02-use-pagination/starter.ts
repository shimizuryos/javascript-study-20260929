import { useMemo, useState } from 'react';

export function usePagination(total: number, pageSize = 10) {
  const [page, setPage] = useState(1);

  const pageCount = 1; // TODO
  const next = () => {}; // TODO
  const prev = () => {}; // TODO

  // TODO: 0 始まりにして、useMemo で参照を安定させる
  const pagination = { pageIndex: page, pageSize };

  return { page, pageCount, canPrev: false, canNext: false, next, prev, pagination };
}
