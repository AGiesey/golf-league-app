## 1. Repo Root Setup

- [ ] 1.1 Create `.gitignore` with `.env`, build artifacts, and IDE files excluded
- [ ] 1.2 Create `.env.example` documenting all required environment variables (`ConnectionStrings__Default`, `ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_URL`, postgres credentials)
- [ ] 1.3 Create `docker-compose.yml` with `postgres`, `api`, and `web` services on shared `app-net` network with healthcheck-based `depends_on`

## 2. API Scaffold

- [ ] 2.1 Initialize ASP.NET Core minimal API project at `/api` (`dotnet new webapi --use-minimal-apis`)
- [ ] 2.2 Add EF Core and Npgsql packages to the project
- [ ] 2.3 Create `AppDbContext` with `ConnectionStrings__Default` configuration binding
- [ ] 2.4 Add migration runner to `Program.cs` (call `MigrateAsync` before `app.Run()`)
- [ ] 2.5 Register CORS policy reading allowed origins from `ALLOWED_ORIGINS` env var
- [ ] 2.6 Add `GET /health` endpoint returning HTTP 200
- [ ] 2.7 Create initial EF Core migration (empty baseline)
- [ ] 2.8 Write `api/Dockerfile` with a `build` stage and a `runtime` stage; stub a `development` stage as a comment

## 3. Web Scaffold

- [ ] 3.1 Initialize Next.js TypeScript project at `/web` (`npx create-next-app@latest web --typescript --no-tailwind --no-eslint --app`)
- [ ] 3.2 Create `web/lib/api.ts` exporting `apiFetch` typed wrapper reading `NEXT_PUBLIC_API_URL`
- [ ] 3.3 Add `NEXT_PUBLIC_API_URL` to `web/.env.local.example` with default pointing to `http://localhost:5000`
- [ ] 3.4 Write `web/Dockerfile` with a `deps`, `build`, and `runner` stage following Next.js standalone output pattern

## 4. Docker Compose Wiring

- [ ] 4.1 Configure `postgres` service with healthcheck (`pg_isready`), credentials from env vars, and a named volume for data persistence
- [ ] 4.2 Configure `api` service: build from `./api`, expose port 5000, inject `ConnectionStrings__Default` and `ALLOWED_ORIGINS` from env, `depends_on` postgres healthcheck
- [ ] 4.3 Configure `web` service: build from `./web`, expose port 3000, inject `NEXT_PUBLIC_API_URL`, `depends_on` api healthcheck

## 5. Verification

- [ ] 5.1 Run `docker compose up -d` from a clean state and confirm all three services reach running/healthy
- [ ] 5.2 Confirm `GET http://localhost:5000/health` returns 200
- [ ] 5.3 Confirm `http://localhost:3000` loads in a browser without errors
- [ ] 5.4 Confirm postgres data volume persists across `docker compose down` / `docker compose up -d`
