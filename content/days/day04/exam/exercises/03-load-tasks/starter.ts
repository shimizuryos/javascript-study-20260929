import { fetchTask } from './api';

export async function loadTaskTitle(id: number | null): Promise<string> {
  // TODO: null なら API を呼ばずに '(未選択)'。失敗したら '読み込み失敗: 理由'
  return '';
}

export async function loadAssignees(ids: number[]): Promise<string[]> {
  // TODO: Promise.all で並列に取得し、担当者名 (null なら '未割り当て') の配列を返す
  return [];
}
