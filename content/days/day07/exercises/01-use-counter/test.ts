import { act, renderHook } from '@testing-library/react';
import { useCounter } from './main';

test('初期値を返す (省略時は 0)', () => {
  expect(renderHook(() => useCounter()).result.current.count).toBe(0);
  expect(renderHook(() => useCounter(10)).result.current.count).toBe(10);
});

test('increment / decrement で 1 ずつ増減する', () => {
  const { result } = renderHook(() => useCounter(5));
  act(() => result.current.increment());
  expect(result.current.count).toBe(6);
  act(() => result.current.decrement());
  act(() => result.current.decrement());
  expect(result.current.count).toBe(4);
});

test('1 回の act の中で increment を 3 回呼ぶと +3 になる', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
    result.current.increment();
    result.current.increment();
  });
  expect(result.current.count).toBe(3);
});

test('reset で初期値に戻る', () => {
  const { result } = renderHook(() => useCounter(10));
  act(() => result.current.increment());
  act(() => result.current.reset());
  expect(result.current.count).toBe(10);
});

test('再レンダーされても increment / decrement / reset は同じ関数のまま', () => {
  const { result } = renderHook(() => useCounter(1));
  const first = result.current;
  act(() => result.current.increment());
  expect(result.current.count).toBe(2);
  expect(result.current.increment).toBe(first.increment);
  expect(result.current.decrement).toBe(first.decrement);
  expect(result.current.reset).toBe(first.reset);
});
