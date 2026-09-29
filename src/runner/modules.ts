/**
 * 演習コードから import できるライブラリの一覧。
 * ここに無いパッケージを import すると「この演習では使えません」というエラーになる。
 */
import * as React from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as DomTestingLibrary from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import * as Nuqs from 'nuqs';
import * as NuqsTesting from 'nuqs/adapters/testing';
import * as ReactQuery from '@tanstack/react-query';
import * as ReactTable from '@tanstack/react-table';
import * as TestingLibrary from '@testing-library/react';
import * as NextMock from './next-mock';
import * as NuqsNextMock from './nuqs-next-mock';

/**
 * 学習者のコードに渡す React の useState / useReducer には、更新回数の上限を付ける。
 * useEffect の中で毎回 state を更新するミス (Day 7) をすると、テスト中の act() が
 * 永遠に終わらずタブごと固まってしまうため、一定回数を超えたら例外にして止める。
 */
let updateGuard: () => void = () => {};

export function setUpdateGuard(guard: () => void) {
  updateGuard = guard;
}

function guardDispatch<A extends unknown[]>(dispatch: (...args: A) => void) {
  return (...args: A) => {
    updateGuard();
    dispatch(...args);
  };
}

type AnyDispatch = (...args: unknown[]) => void;
const rawUseState = React.useState as unknown as (initial: unknown) => [unknown, AnyDispatch];
const rawUseReducer = React.useReducer as unknown as (...args: unknown[]) => [unknown, AnyDispatch];

// 更新関数はレンダーをまたいで同じ参照のまま (本物の setState と同じ) になるよう、最初の 1 回だけ包む
const useStateGuarded = ((initial: unknown) => {
  const [state, setState] = rawUseState(initial);
  const [guarded] = React.useState(() => guardDispatch(setState));
  return [state, guarded];
}) as unknown as typeof React.useState;

const useReducerGuarded = ((...args: unknown[]) => {
  const [state, dispatch] = rawUseReducer(...args);
  const [guarded] = React.useState(() => guardDispatch(dispatch));
  return [state, guarded];
}) as unknown as typeof React.useReducer;

const GuardedReact = { ...React, useState: useStateGuarded, useReducer: useReducerGuarded };

function esm(ns: object, defaultExport?: unknown): Record<string, unknown> {
  const n = ns as Record<string, unknown>;
  return { ...n, default: defaultExport ?? n.default ?? ns, __esModule: true };
}

export const libraryModules: Record<string, Record<string, unknown>> = {
  react: esm(GuardedReact, GuardedReact),
  'react/jsx-runtime': esm(JsxRuntime),
  'react-dom': esm(ReactDOM),
  'react-dom/client': esm(ReactDOMClient),
  '@testing-library/react': esm(TestingLibrary),
  '@testing-library/dom': esm(DomTestingLibrary),
  '@testing-library/user-event': esm({ userEvent }, userEvent),
  nuqs: esm(Nuqs),
  'nuqs/adapters/testing': esm(NuqsTesting),
  'nuqs/adapters/next/app': esm(NuqsNextMock),
  '@tanstack/react-query': esm(ReactQuery),
  '@tanstack/react-table': esm(ReactTable),
  'next/navigation': esm(NextMock),
  'next/link': esm({ default: NextMock.Link }, NextMock.Link),
  '@study/next-mock': esm(NextMock),
};

export const availableModuleNames = Object.keys(libraryModules).filter((n) => n !== 'react/jsx-runtime');
