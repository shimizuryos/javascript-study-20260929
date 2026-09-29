'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { fetchMembers } from './api';

export const SCOPES = ['all', 'mine', 'team'] as const;

const memberParsers = {
  scope: parseAsStringLiteral(SCOPES).withDefault('all'),
  page: parseAsInteger.withDefault(1),
  q: parseAsString,
};

/** 別のチームが書いた「メンバー一覧」用のフック (useSharedScopeQuery の変種) */
export function useMemberList() {
  const [{ scope, page, q }, setParams] = useQueryStates(memberParsers, {
    urlKeys: { scope: 's', page: 'p' },
    history: 'push',
  });

  const query = useQuery({
    queryKey: ['members', { scope, page, q }] as const,
    queryFn: ({ signal }) => fetchMembers({ scope, page, q }, signal),
    placeholderData: keepPreviousData,
    select: (data) => ({ names: data.items.map((m) => m.name), total: data.total }),
  });

  return { scope, page, q, setParams, data: query.data, isFetching: query.isFetching };
}
