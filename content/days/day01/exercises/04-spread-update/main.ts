export type Query = { page: number; q: string; sort: 'new' | 'old' };

export const nextQuery = (query: Query, patch: Partial<Query>): Query => ({ ...query, page: 1, ...patch });

export const addTag = (tags: string[], tag: string): string[] => (tags.includes(tag) ? [...tags] : [...tags, tag]);
