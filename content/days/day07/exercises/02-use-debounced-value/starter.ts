import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  // TODO: 値を state で持ち、useEffect + setTimeout で delayMs 後に更新する
  // TODO: クリーンアップで clearTimeout する
  return value;
}
