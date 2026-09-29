import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/vendor/**', 'content/**']),
  {
    files: ['public/runner/**/*.js'],
    languageOptions: { sourceType: 'script', globals: { self: 'readonly', importScripts: 'readonly' } },
  },
]);
