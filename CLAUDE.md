# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands (run from `memehub_cat/`)

```bash
npm run dev          # Start dev server with Turbopack (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config v9)
npm run lint:fix     # ESLint with --fix
npm run typecheck    # tsc --noEmit
npm run check        # lint + typecheck combined
npm run format:check # Prettier check
npm run format:write # Prettier write
npm run db:generate  # Drizzle Kit: generate SQL migration
npm run db:migrate   # Drizzle Kit: apply migrations
npm run db:push      # Drizzle Kit: push schema directly
npm run db:studio    # Drizzle Kit: open DB studio UI
```

Prefix with `SKIP_ENV_VALIDATION=1` for build environments without .env.

## Architecture

**Stack:** Next.js 15 (App Router) + React 19 + tRPC v11 + Drizzle ORM v0.41 (SQLite/libSQL) + NextAuth v5 (beta) + Tailwind CSS v4 + shadcn/ui

### Directory Layout

```
src/
  app/                          # Next.js App Router pages & layouts
    api/
      auth/[...nextauth]/       # NextAuth HTTP handler (catch-all)
      trpc/[trpc]/              # tRPC HTTP handler (catch-all)
    layout.tsx                  # Root layout (TRPCReactProvider, fonts)
    page.tsx                    # Homepage
    _components/                # Page-specific client components
  components/
    ui/                         # shadcn/ui primitives (button.tsx, etc.)
  lib/
    utils.ts                    # cn() helper (clsx + tailwind-merge)
  server/
    auth/
      config.ts                 # NextAuth config (Discord provider + Drizzle adapter)
      index.ts                  # Auth singleton (cached)
    db/
      index.ts                  # Drizzle client instance (libSQL)
      schema.ts                 # All DB tables + relations (prefix: memehub_cat_)
    api/
      root.ts                   # appRouter — register all sub-routers here
      trpc.ts                   # tRPC init, context, publicProcedure, protectedProcedure
      routers/                  # One file per logical router (post.ts, etc.)
  trpc/
    react.tsx                   # TRPCReactProvider, typed `api` client, type helpers
    server.ts                   # Server-side caller factory + HydrateClient
    query-client.ts             # TanStack QueryClient factory
  styles/
    globals.css                 # Tailwind v4 + shadcn/ui theme tokens
  env.js                        # Runtime env validation (@t3-oss/env-nextjs + Zod)
```

### tRPC Data Flow

1. **Define a router** in `src/server/api/routers/` using `createTRPCRouter`
2. **Register** in `src/server/api/root.ts` (`appRouter = createTRPCRouter({...})`)
3. **Client calls** via `api.someRouter.someProcedure.useQuery()` (auto-typed)
4. **Context** (`src/server/api/trpc.ts`) provides `db` and `session` to all procedures

### Key Patterns

- **Procedures:** Use `publicProcedure` for unauthenticated, `protectedProcedure` for auth-required
- **Schema tables:** Use `createTable` (wraps `sqliteTableCreator`) — tables auto-prefixed with `memehub_cat_`
- **Relations:** Define in `schema.ts` with `relations()` helper
- **Path alias:** `~/` maps to `./src/` (e.g., `import { db } from "~/server/db"`)
- **Env vars:** Defined in `src/env.js` — validated at runtime via Zod
- **DB migrations:** Use `npm run db:generate` then `npm run db:migrate` (prefer migrate over push)
- **Auth:** Protected routes/procedures check `ctx.session.user` (NextAuth session)

## Project Specifications

Detailed specs exist in `../instructions/` (outside the Next.js project):
- `PRD.md` — Product requirements (Chinese)
- `tech.md` — Technical architecture (Chinese)
- `agent.md` — AI agent implementation guide

The project is in early development — most MemeBox-specific features (meme CRUD, upload, tags, favorites, search) are not yet implemented. The current codebase is a vanilla Create T3 App v7.40 scaffold with only the `posts` example table and NextAuth adapter tables.

## Naming Convention

Database tables use lowercase snake_case in SQL but camelCase in JS via Drizzle column definitions. tRPC routers use camelCase (e.g., `postRouter`, `memeRouter`).
