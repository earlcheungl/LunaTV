# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LunaTV Enhanced Edition — a video streaming aggregation platform (Next.js 16 App Router, React 19, TypeScript). Aggregates content from third-party sources, Douban, TMDB, Bangumi, YouTube, Bilibili, IPTV, and others. Chinese-language primary.

## Commands

```bash
pnpm install          # install deps (pnpm 10.14.0, Node v24)
pnpm dev              # dev server (auto-runs gen:manifest first)
pnpm build            # production build
pnpm lint             # next lint
pnpm lint:fix         # eslint --fix + prettier format
pnpm lint:strict      # eslint --max-warnings=0 src
pnpm typecheck        # tsc --noEmit --incremental false
pnpm test             # jest
pnpm test:watch       # jest --watch
pnpm format           # prettier -w .
```

Always run `pnpm lint && pnpm typecheck` before committing. Pre-commit hook runs lint-staged (eslint + prettier on staged files).

## Path Aliases

- `@/*` → `./src/*`
- `~/*` → `./public/*`

Always use `@/` imports for src files. Enforced by tsconfig, jest.config, and next.config.

## Architecture

### Provider Tree (src/app/layout.tsx)

`ThemeProvider → QueryProvider → GlobalCacheProvider → DownloadProvider → WatchRoomProvider → SiteProvider`

Root layout is `force-dynamic` and injects `window.RUNTIME_CONFIG` via inline `<script>` containing server-side config (storage type, proxy settings, feature flags).

### Storage Backends

Selected via `NEXT_PUBLIC_STORAGE_TYPE` env var: `localstorage` (default, client-only), `redis`, `upstash`, `sqlite`. The `IStorage` interface in `src/lib/types.ts` defines all data operations. Server-side DB is a singleton `DbManager` in `src/lib/db.ts`. Client-side hybrid (localStorage + server API) in `src/lib/db.client.ts`. Each backend has its own adapter file in `src/lib/`.

### Data Fetching

TanStack Query (React Query v5) is used for all server state. Custom hooks in `src/hooks/` (e.g., `usePlayRecordsQuery`, `useFavoritesQuery`, `useHomePageQueries`). Query keys follow domain patterns like `['playRecords']`, `['favorites']`, `['doubanDetails', id]`.

A `GlobalCacheInvalidator` in QueryProvider listens for custom data update events (dispatched from `db.client.ts`) and invalidates relevant query caches.

### API Routes

All under `src/app/api/` as Next.js Route Handlers (GET/POST exports). Key groups: `admin/` (config management), `auth/` (OIDC), `login/`, `register/`, `favorites/`, `playrecords/`, `search/`, `douban/`, `sources/`, `user/`.

### Authentication

Cookie-based (`user_auth` cookie, HMAC-SHA256 signed). Roles: `owner` (env USERNAME), `admin`, `user`. Auth helpers in `src/lib/auth.ts`. Admin role resolution in `src/lib/admin-auth.ts`.

### Runtime Config

Server reads config from DB → serializes to `window.RUNTIME_CONFIG` → client components read from this global. This bridges server-only config to the client without extra API calls.

### Real-time

Watch rooms use Socket.io (`src/components/WatchRoomProvider.tsx`, `src/app/play/hooks/useWatchRoomSync.ts`).

### Caching Layers

Multi-layer: `ClientCache` (in-memory, `src/lib/client-cache.ts`), localStorage fallback, server-side DB cache with TTL, TanStack Query cache (2hr default).

## Key Directories

| Path | Purpose |
|---|---|
| `src/app/` | Pages + API routes (App Router) |
| `src/components/` | Shared React components (~55+) |
| `src/lib/` | Core logic: DB adapters, auth, caching, proxy, scrapers, AI |
| `src/hooks/` | Custom React hooks (~18) |
| `src/contexts/` | React context providers |
| `scripts/` | Build scripts (manifest gen, EdgeOne build) |

## Conventions

- **Commits**: Conventional commits via commitlint. Allowed types: `feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `ci`, `test`, `perf`, `revert`, `vercel`.
- **Import ordering**: Enforced by `eslint-plugin-simple-import-sort` — external → CSS → `@/lib`, `@/hooks` → `@/components` → relative. Run `pnpm lint:fix` to auto-sort.
- **TypeScript**: Strict mode on, but `strictNullChecks: false` and `noImplicitAny: false`.
- **reactStrictMode**: Disabled in next.config.js.
- **Image optimization**: Disabled (`images.unoptimized: true`) — proxied images are incompatible with Next.js optimization.

## Testing

Jest with jsdom, next-router-mock. Module aliases mapped in jest.config.js. SVG imports mocked via `src/__mocks__/svg.tsx`. Setup in `jest.setup.js`.

## Deployment

- **Docker**: Multi-stage Dockerfile, `node:22-alpine`, custom `start.js` entrypoint (generates manifest, starts Next.js standalone, runs hourly cron). `DOCKER_BUILD=true` enables standalone output.
- **Vercel**: `vercel.json` present
- **Render**: `render.yaml` present
- **EdgeOne**: `edgeone.json` + GitHub Actions workflow

## Environment Variables

Key vars: `NEXT_PUBLIC_STORAGE_TYPE`, `USERNAME`/`PASSWORD` (admin creds), `REDIS_URL`, `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_DOUBAN_PROXY`, `NEXT_PUBLIC_DOUBAN_IMAGE_PROXY`, `NEXT_PUBLIC_DISABLE_YELLOW_FILTER`, `NEXT_PUBLIC_FLUID_SEARCH`, `NEXT_PUBLIC_SEARCH_MAX_PAGE`.

## Docs

Extensive docs in `docs/` covering deployment, features, integrations, auth, and advanced config. Check `docs/README.md` for the full index.
