import { useMemo, useState } from 'react';

export function usePagination(total: number, pageSize = 10) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const next = () => setPage((p) => Math.min(p + 1, pageCount));
  const prev = () => setPage((p) => Math.max(p - 1, 1));

  const pagination = useMemo(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);

  return { page, pageCount, canPrev: page > 1, canNext: page < pageCount, next, prev, pagination };
}
