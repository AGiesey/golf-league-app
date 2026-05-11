## Context

The commissioner matchup page (`/commissioner/matchups`) already supports create, edit, and delete for matchups per week. The `MatchupsClient.tsx` client component fetches matchups for the selected week and renders them. The `teams` list is fetched once in the server component and passed down. The API (`Program.cs`) uses EF Core Minimal APIs against Postgres.

The two new read-only views (unscheduled teams, history matrix) and the inline warning all derive from data already in the database — no schema changes are needed. The sole design questions are where to compute the data (server vs. client) and how to structure the new API surface.

## Goals / Non-Goals

**Goals:**
- Surface unscheduled teams for the selected week as clickable chips that pre-populate the create dialog
- Surface a season-wide pairing history matrix (collapsible) showing how many times each pair has played in prior regular weeks
- Show a non-blocking inline warning in the create/edit dialog when the selected pair has already played

**Non-Goals:**
- Enforcing any scheduling constraint (unmatched teams allowed, repeated pairings allowed)
- Color coding the matrix
- Per-team detail in the unscheduled list (member names, etc.)
- Auto-pairing suggestions

## Decisions

### 1. Two new API endpoints rather than expanding the existing matchups endpoint

**Decision:** Add `GET /commissioner/season/matchups/unscheduled-teams?weekId=<id>` and `GET /commissioner/season/pairing-history` as separate endpoints.

**Rationale:** Embedding this data in the existing `GET /commissioner/season/matchups` response would bloat every call with season-wide aggregation even when only the matchup list is needed. Separate endpoints let the client fetch them independently and cache them at different scopes (unscheduled-teams is week-scoped and changes on every create/delete; pairing-history is season-scoped and changes only when matchups change).

**Alternative considered:** Single "week detail" endpoint returning matchups + unscheduled teams together. Rejected because pairing history is season-scoped, not week-scoped, so it doesn't fit the same envelope.

### 2. Pairing history computed with LEAST/GREATEST at query time via EF raw SQL

**Decision:** Use `FormattableString` EF raw SQL to compute `COUNT(*) GROUP BY (LEAST(team_a_id, team_b_id), GREATEST(team_a_id, team_b_id))` filtered to prior regular weeks of the active season.

**Rationale:** EF LINQ cannot express pair canonicalization without write-time normalization. Raw SQL with parameterized inputs is safe, readable, and avoids a migration. The result set is small (N² pairs where N is the number of teams, typically ≤ 20).

**Alternative considered:** Storing a canonical pair key at write time. Rejected — adds migration complexity for a read-only aggregation.

### 3. Pairing history fetched once per selected week, not per form open

**Decision:** Fetch pairing history when the week changes (same trigger as the matchup list), not when the create/edit dialog opens.

**Rationale:** The history is needed both for the matrix display and the inline warning. Fetching once and sharing state between the matrix and the form avoids a redundant request every time the dialog opens. The data is small and stale-on-create is acceptable (a newly created matchup shows in the history only after the commissioner closes and re-opens the week).

### 4. Inline warning is derived from already-fetched pairing history — no extra request

**Decision:** The create/edit form reads the in-memory `pairingHistory` state to compute whether the selected pair has played before. No new fetch when Team B is selected.

**Rationale:** Pairing history is already in client state from the matrix fetch. A per-selection fetch would add latency and complexity with no benefit.

### 5. Unscheduled-teams list drives chip-click pre-selection via lifted state

**Decision:** Clicking a chip calls `openCreateForm(teamId)` — the existing form open handler is extended to accept an optional pre-selected team ID.

**Rationale:** Keeps the create flow in the existing dialog rather than adding a separate flow. Minimal change to existing form logic.

### 6. Matrix is collapsible client-side only — no URL state

**Decision:** Matrix open/closed state is local `useState`, not persisted to the URL.

**Rationale:** The matrix is a secondary aid; its open/closed state is not worth URL space. The week selector is the primary navigation state already persisted via `?weekId=`.

## Risks / Trade-offs

- **Raw SQL in EF context**: The pairing-history query uses `FromSqlRaw` / `Database.SqlQuery`. This is a narrow escape hatch and is fully parameterized; injection risk is nil. Reviewers unfamiliar with the codebase may flag it, but it is the right call here.
- **Stale pairing history after create/edit**: The history is fetched per week-change, so creating a new matchup doesn't refresh the matrix until the commissioner switches weeks and back. Mitigation: refetch history inside `submitForm` on success (same pattern as matchup list).
- **Matrix renders for large team counts**: With 20 teams a 20×20 grid is 400 cells — manageable. No pagination needed at this scale.
