## Context

The project scaffold is running (postgres, api, web all healthy). No code path touches the database yet — migrations exist but no entities are mapped. This spike adds the minimal slice needed to prove the full web → API → EF Core → PostgreSQL → response loop works before real feature development begins.

## Goals / Non-Goals

**Goals:**
- Prove Next.js `apiFetch` reaches the API container over Docker networking
- Prove EF Core can write and read a record through the Npgsql provider
- Prove a new migration can be authored, applied on startup, and used immediately
- Surface any gap in the scaffold (CORS, serialization, env config) before it affects real features

**Non-Goals:**
- Authentication or authorization
- Any real domain data — this is a throwaway probe
- Error handling beyond what is needed to see the response in the browser
- Performance or load testing

## Decisions

### D1: `GET /ping` writes then reads
The endpoint inserts a `Ping` row (with a server-generated UTC timestamp), then immediately reads it back and returns `{ id, createdAt }`. A read-only endpoint would not exercise EF Core writes or the migration. A write-only endpoint would not confirm the read path.

**Why not a separate write + read endpoint:** One endpoint keeps the spike self-contained and makes the test obvious — one browser request, one visible result.

### D2: Minimal `Ping` entity — id + timestamp only
`Ping` has `int Id` (identity PK) and `DateTime CreatedAt` (UTC, defaulted by the database). No other columns. Enough to exercise entity mapping, value conversion, and migration generation without designing a real schema.

### D3: Next.js `/ping` page — server component fetching on each request
Use a Next.js Server Component (App Router) that calls `apiFetch` on the server side. This avoids CORS for the server-side call, keeps the page simple, and confirms Docker internal networking (web container → api container) works as well as the host-side mapping.

**Why not a client component:** Client-side fetch would test CORS end-to-end (valuable), but server component is simpler for a spike and still proves `apiFetch` and the API URL config. CORS is already exercised by the scaffold healthcheck from the browser.

### D4: Migration authored manually (no `dotnet ef` tooling in CI)
Since `dotnet` is not installed on the host machine, the migration file is written by hand (same pattern as the baseline migration). The snapshot is updated to reflect the new entity.

## Risks / Trade-offs

- **Spike code left in the codebase** → Document in the page that it is a spike and should be removed once real features land. Low risk — it's one endpoint and one page.
- **Server-side fetch doesn't test browser CORS** → Acceptable for this spike; CORS policy correctness is covered by the scaffold spec, not this one.
- **Manual migration file** → If EF Core model-snapshot format drifts from what `dotnet ef` would generate, future auto-generated migrations may conflict. Mitigate by keeping the spike entity trivial and removing it before real schema work.
