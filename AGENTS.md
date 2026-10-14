<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.
This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

# Project notes

- Static-export Next.js app (`output: 'export'`) served by Cloudflare Workers static assets (`wrangler.jsonc`); only `/api/*` runs `worker/index.ts` (GitHub OAuth, sessions, progress API on D1). `PAGES_BASE_PATH` stays empty for Cloudflare.
- Progress sync: the client merges local and server progress (`src/lib/progress/merge.ts`, must stay idempotent/commutative) and saves with optimistic locking (409 → refetch and merge). Reset/import replace instead of merging.
- `npm run e2e:cloudflare` runs the site + worker + local D1 via `wrangler dev` with `DEV_LOGIN=1` (dev login works only on localhost).
- Learning content lives in `content/` — follow `docs/CONTENT_GUIDE.md`. Every exercise is verified by `npm test` (solution passes, starter fails).
- The in-browser runner (`src/runner/`) is shared by the sandbox iframe (`src/sandbox/main.ts`, bundled by `scripts/build-sandbox.mjs` with the React development build) and by Vitest in CI.
- TanStack Table is intentionally pinned to v8 (`useReactTable`), and `typescript` to v6 (the last JS-based compiler, needed for in-browser type checking).
- Before pushing: `npm run verify`, `npm run build`, `npm run e2e` and `npm run e2e:cloudflare`.
