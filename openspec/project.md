# Golf League App

## Overview
A web application for managing recreational golf leagues. Supports league setup,
player management, score entry, standings tracking, and golfer-facing results views.

## Stack
- **Frontend:** Next.js (latest, TypeScript)
- **Backend:** ASP.NET Core (C#), minimal API
- **ORM:** Entity Framework Core (code-first migrations)
- **Database:** PostgreSQL
- **Containerization:** Docker Compose (monorepo, single `docker compose up -d`)

## Repository Structure
- `/web` — Next.js frontend
- `/api` — ASP.NET Core backend
- `docker-compose.yml` — root-level, orchestrates all services
- `openspec/` — spec artifacts

## Role Hierarchy
- **Super Admin** — owns the software, sets up courses (SQL only at MVP)
- **Course Admin** — manages leagues at their course: dates, tee times, makeup days
- **Commissioner** — runs a specific league: score entry, pairings, fun weeks
- **Golfer** — read-only: views scores, standings, skins, side contest results

## Key Constraints
- A fresh clone on any machine must be fully runnable with `docker compose up -d`
- Database creation and EF Core migrations run automatically on API container startup
- No manual setup steps beyond Docker being installed
- All date/time values stored in UTC, converted to local time at display

## MVP Scope
- Course and league data models (set up via SQL at MVP)
- Golfer accounts with login
- Commissioner creates/manages a league, assigns golfers to teams
- Manual pairing entry by commissioner
- Score entry by commissioner
- League-established handicap (commissioner enters a number per golfer)
- Basic win/loss match result per week
- Season standings (cumulative wins/losses)
- Golfer view: personal scores, team record, standings
- Email notifications at key domain events (pairing posted, score entered,
  schedule changed)

## Post-MVP (Do Not Build Yet — Design For)
- Auto-generated pairings
- GHIN handicap integration
- Playoffs and championships
- Fun weeks with their own scoring/team logic
- Multiple skins and side contest formats
- Course admin UI
- Push/SMS notifications

## Extension Points
These areas must be designed for changeability. New implementations should be
addable without modifying existing ones.

### Scoring Formats
Treat scoring as a pluggable strategy. Start with one format. New formats must
be addable without touching existing scoring logic.

### Handicap Systems
Abstract handicap calculation behind an interface. MVP uses league-established
(commissioner-entered) handicaps. GHIN and other providers come later.

### Fun Weeks
Modeled as a first-class entity from day one, even if MVP behavior is just a
reserved slot outside the regular schedule. Must support future scoring formats
and dynamic team assignment without migration pain.

### Pairing Logic
The pairing result (who plays who) is what the rest of the system consumes.
How pairings are generated (manual vs auto) must be decoupled from how they
are stored and used.

### Side Contests (Skins, CTH, etc.)
Contest types must be extensible. Start with one built-in format. New contest
types should be addable as discrete implementations.

### Notification System
Domain events (score entered, pairing posted, schedule changed, makeup day added)
must be emitted through a consistent abstraction. MVP delivers via email only.
Push and SMS are post-MVP but the hook must exist from the start.

### Season Results
Season standings are derived from weekly match results. The standings calculation
must remain decoupled from the weekly scoring format so playoff logic and
alternative season structures can be layered on later.

## Development Philosophy
- MVP-first, iterative feature additions via discrete OpenSpec proposals
- Each extension point treated as an interface, not an implementation
- Long-term maintainability over short-term speed
- Super admin and course setup handled via SQL until a UI is justified