## Why

The repository currently contains only the OpenSpec directory — there is no runnable application. We need to establish the foundational monorepo structure so developers can clone and run the full stack with a single `docker compose up -d` and begin iterating on features.

## What Changes

- Introduce `/web` — Next.js (TypeScript) frontend application scaffold
- Introduce `/api` — ASP.NET Core (C#) minimal API backend scaffold
- Introduce `docker-compose.yml` at the repo root orchestrating all services (web, api, postgres)
- Configure the API container to auto-run EF Core migrations on startup
- Provide `.env.example` documenting required environment variables
- Establish a basic health-check endpoint (`GET /health`) on the API

## Capabilities

### New Capabilities

- `repo-scaffold`: Top-level monorepo layout with Docker Compose wiring web, api, and postgres together — single command brings up the full stack
- `api-scaffold`: ASP.NET Core minimal API skeleton: project structure, EF Core setup, migration runner, health endpoint, CORS, and environment configuration
- `web-scaffold`: Next.js TypeScript app skeleton: base layout, environment config, and API client utility pointing at the backend

### Modified Capabilities

<!-- none — no existing specs -->

## Impact

- Creates `/web`, `/api`, and `docker-compose.yml` from scratch
- No existing code is modified
- Establishes the Docker networking, port conventions, and environment variable contract that all future capabilities will build on
