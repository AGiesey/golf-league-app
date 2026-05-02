## Context

The repo is a fresh monorepo with no application code. The target stack is Next.js (TypeScript) for the frontend, ASP.NET Core (C#) minimal API for the backend, PostgreSQL for the database, and Docker Compose as the single orchestration layer. A fresh clone must be fully runnable with `docker compose up -d` — no manual setup beyond Docker.

## Goals / Non-Goals

**Goals:**
- Single `docker compose up -d` brings up web, api, and postgres with no other prerequisites
- API container automatically applies EF Core migrations on startup (no manual `dotnet ef database update`)
- Next.js app is reachable in a browser; API is reachable with a `GET /health` returning 200
- `.env.example` documents every required environment variable
- Structure is consistent with how all future capabilities will be added

**Non-Goals:**
- No application features (auth, leagues, scores, etc.) — this is skeleton only
- No production hardening (TLS, secrets management, CDN, etc.)
- No CI/CD pipeline setup
- No seeding of data

## Decisions

### D1: Docker Compose service topology
Three services: `postgres`, `api`, `web`. The `api` depends on `postgres` (healthcheck-based). The `web` depends on `api` (healthcheck-based). All on a shared bridge network `app-net`.

Port conventions: postgres → 5432, api → 8080 (internal) mapped to 5000 (host), web → 3000.

**Why:** Healthcheck-based `depends_on` is the simplest way to guarantee ordering without polling scripts. Port 5000 for the API host mapping avoids conflicts with common local services.

### D2: Migration runner pattern — startup code, not a separate container
EF Core migrations run at the top of `Program.cs` before `app.Run()`, inside a `using (var scope = ...)` block, calling `dbContext.Database.MigrateAsync()`.

**Why over a separate init container:** Fewer moving parts. The API knows its own schema. Idempotent — `MigrateAsync` is a no-op if already up to date. The alternative (init container running `dotnet ef database update`) requires shipping the EF tools image, adds orchestration complexity, and is harder to debug.

**Trade-off:** If multiple API replicas start simultaneously they will race on migrations. Acceptable for MVP (single replica). A distributed lock (e.g. advisory lock) can be added later if needed.

### D3: Next.js API client utility
A thin `lib/api.ts` module that reads `NEXT_PUBLIC_API_URL` from env and exports a typed `apiFetch` wrapper. No third-party HTTP library at this stage.

**Why:** Establishes the pattern all future features will follow. Avoids coupling the scaffold to a library choice before requirements are clear.

### D4: Environment variable strategy
- Backend: `ASPNETCORE_ENVIRONMENT`, `ConnectionStrings__Default` (EF Core convention), `ALLOWED_ORIGINS` (CORS)
- Frontend: `NEXT_PUBLIC_API_URL`
- Docker Compose: reads from `.env` file at repo root; `.env.example` is committed, `.env` is gitignored

**Why:** EF Core's `ConnectionStrings__Default` double-underscore convention maps directly to `IConfiguration` without custom binding code.

## Risks / Trade-offs

- **Migration race on multi-replica start** → Acceptable at MVP; document in `.env.example` that single-replica is assumed
- **Hot reload in Docker** → Next.js fast refresh works via volume mount; dotnet watch requires additional Dockerfile target. Not in scope for scaffold but Dockerfile structure should leave room for a `dev` stage.
- **`.env` not committed** → New contributors must copy `.env.example` to `.env`. Mitigated by clear README note (out of scope here — will be addressed when a README is warranted).

## Open Questions

- Should the API Dockerfile include a `dev` watch stage now, or defer to a future change? (Recommendation: stub a `development` stage as a comment so the pattern is established.)
- Preferred Next.js version pin — latest stable at time of implementation.
