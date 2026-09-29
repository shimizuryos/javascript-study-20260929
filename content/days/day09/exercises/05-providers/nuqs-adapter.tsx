// 本物のアプリでは: import { NuqsAdapter } from 'nuqs/adapters/next/app';
// この実行環境では Next.js 本体が動かないので、nuqs のテスト用アダプターを同じ名前で使う。
export { NuqsTestingAdapter as NuqsAdapter } from 'nuqs/adapters/testing';
