'use client';

import { SCOPES, useSharedScopeQuery, type Scope } from './useSharedScopeQuery';
import { fetchMembers, PAGE_SIZE } from './api';

/** メンバー一覧専用のラッパー */
export function useMembersQuery() {
  // TODO: resource 名と pageSize を README の仕様どおりにする
  return useSharedScopeQuery('TODO', fetchMembers);
}

export const SCOPE_LABELS: Record<Scope, string> = {
  all: 'すべて',
  mine: '自分が追加',
  team: '自分のチーム',
};

export function ScopeTabs() {
  // TODO: useMembersQuery を使って、SCOPES の数だけボタンを並べる
  //       + 今の scope のボタンに aria-pressed、下に「全 N 件」
  return <div />;
}
