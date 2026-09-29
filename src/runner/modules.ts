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

function esm(ns: object, defaultExport?: unknown): Record<string, unknown> {
  const n = ns as Record<string, unknown>;
  return { ...n, default: defaultExport ?? n.default ?? ns, __esModule: true };
}

export const libraryModules: Record<string, Record<string, unknown>> = {
  react: esm(React),
  'react/jsx-runtime': esm(JsxRuntime),
  'react-dom': esm(ReactDOM),
  'react-dom/client': esm(ReactDOMClient),
  '@testing-library/react': esm(TestingLibrary),
  '@testing-library/dom': esm(DomTestingLibrary),
  '@testing-library/user-event': esm({ userEvent }, userEvent),
  nuqs: esm(Nuqs),
  'nuqs/adapters/testing': esm(NuqsTesting),
  '@tanstack/react-query': esm(ReactQuery),
  '@tanstack/react-table': esm(ReactTable),
  'next/navigation': esm(NextMock),
  'next/link': esm({ default: NextMock.Link }, NextMock.Link),
  '@study/next-mock': esm(NextMock),
};

export const availableModuleNames = Object.keys(libraryModules).filter((n) => n !== 'react/jsx-runtime');
