## 1. API — Entity and Migration

- [ ] 1.1 Create `api/Models/Ping.cs` with `Id` (int) and `CreatedAt` (DateTime UTC) properties
- [ ] 1.2 Add `DbSet<Ping> Pings` to `AppDbContext`
- [ ] 1.3 Write migration file `api/Migrations/20260404000000_AddPings.cs` creating the `pings` table
- [ ] 1.4 Update `api/Migrations/AppDbContextModelSnapshot.cs` to include the `Ping` entity

## 2. API — Endpoint

- [ ] 2.1 Add `GET /ping` endpoint to `Program.cs`: insert a `Ping` row, save, return `{ id, createdAt }` as JSON

## 3. Web — Ping Page

- [ ] 3.1 Create `web/app/ping/page.tsx` as a Server Component that calls `apiFetch<{ id: number; createdAt: string }>("/ping")` and renders the result
- [ ] 3.2 Handle fetch errors in the page — display a message if the API call fails

## 4. Verification

- [ ] 4.1 Rebuild and restart services with `docker compose up -d --build`
- [ ] 4.2 Confirm `GET http://localhost:5001/ping` returns JSON with `id` and `createdAt`
- [ ] 4.3 Confirm `/ping` page in the browser displays the values
- [ ] 4.4 Call `GET /ping` twice and confirm `id` increments each time
