# AGENTS.md

## Quick reference

```bash
pnpm install          # install deps (pnpm 10.14.0, Node v24)
pnpm dev              # dev server (auto-runs gen:manifest first)
pnpm build            # production build (auto-runs gen:manifest first)
pnpm lint             # next lint
pnpm lint:strict      # eslint --max-warnings=0 src
pnpm typecheck        # tsc --noEmit --incremental false
pnpm format           # prettier -w .
pnpm format:check     # prettier -c . (CI dry-run)
pnpm test             # jest
```

Run `pnpm lint && pnpm typecheck` before committing. The pre-commit hook runs `lint-staged` (eslint + prettier on staged files).

## Commit convention

Conventional commits enforced by commitlint. Allowed types: `feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `ci`, `test`, `perf`, `revert`, `vercel`.

## Path aliases

- `@/*` → `./src/*`
- `~/*` → `./public/*`

These are configured in `tsconfig.json`, `jest.config.js`, and `next.config.js` (Turbopack). Always use `@/` imports for src files.

## Architecture

Next.js 16 App Router (`src/app/`). Single-package, not a monorepo.

### Key directories

| Path | Purpose |
|---|---|
| `src/app/` | Pages + API routes (App Router) |
| `src/app/api/` | ~50 API route handlers |
| `src/components/` | Shared React components |
| `src/lib/` | Core logic: DB adapters, auth, caching, proxy, scrapers, AI |
| `src/hooks/` | Custom React hooks |
| `src/contexts/` | React context providers |
| `src/workers/` | Web Workers (danmaku rendering) |
| `src/styles/` | Additional stylesheets |
| `scripts/` | Build scripts (manifest gen, EdgeOne build) |
| `public/` | Static assets |

### Storage backends

The app supports multiple storage backends selected via `NEXT_PUBLIC_STORAGE_TYPE` env var:
- `localstorage` (default, client-only)
- `upstash` (Upstash Redis)
- `redis` (standard Redis / Kvrocks)
- `sqlite`

DB adapter code lives in `src/lib/db.ts` (server) and `src/lib/db.client.ts` (client). Each backend has its own file: `redis.db.ts`, `upstash.db.ts`, `sqlite.db.ts`, `kvrocks.db.ts`.

### Provider tree

`src/app/layout.tsx` wraps the app in a deep provider chain: `ThemeProvider → QueryProvider → GlobalCacheProvider → DownloadProvider → WatchRoomProvider → SiteProvider`. The root layout is `force-dynamic` and injects `window.RUNTIME_CONFIG` for client-side config.

### Runtime config injection

Server-side config (storage type, proxy settings, feature flags) is serialized into `window.RUNTIME_CONFIG` via a `<script>` tag in the layout. Client components read from this global.

## Framework quirks

- `pnpm gen:manifest` generates `public/manifest.json` from `NEXT_PUBLIC_SITE_NAME`. It runs automatically before `dev` and `build` — do not skip it.
- `next.config.js` outputs `standalone` only in production (`NODE_ENV=production`). Docker builds set `DOCKER_BUILD=true`.
- Image optimization is disabled (`images.unoptimized: true`) because proxied images are incompatible with Next.js optimization.
- `reactStrictMode: false` in next.config.js.
- TypeScript strict mode is on but `strictNullChecks: false` and `noImplicitAny: false`.

## Import ordering

Enforced by `eslint-plugin-simple-import-sort` with a specific group order: external → CSS → `@/lib`, `@/hooks` → `@/data` → `@/components`, `@/container` → `@/store` → `@/` → relative → `@/types` → other. Run `pnpm lint:fix` to auto-fix import order.

## Testing

Jest with `jsdom` environment and `next-router-mock`. Setup in `jest.setup.js`. Module aliases (`@/`, `~/`) are mapped in `jest.config.js`. SVG imports are mocked via `src/__mocks__/svg.tsx`.

## Deployment targets

- **Docker**: multi-stage Dockerfile, `node:22-alpine`, custom `start.js` entrypoint
- **Vercel**: `vercel.json` present, standalone output in production
- **Render**: `render.yaml` present
- **EdgeOne**: `edgeone.json` + `scripts/edgeone-build.mjs` + GitHub Actions workflow

## Docs

Extensive docs in `docs/` covering deployment, features, integrations, auth, and advanced config. Check `docs/README.md` for the full index.
