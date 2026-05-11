## Context

`Round`, `HoleScore`, and `Sub` exist in the data model and schema but have no API or UI surface. `Pairing` and `PairingSlot` already link golfers to matchups. `Week.Nine` (Front / Back / Full) was added in `model-week-nine` and drives which holes a week plays. `LeagueConfiguration` currently has no tee-box default, leaving round tee boxes orphaned until the commissioner sets them manually — a documented gap.

This change adds the minimal read + write surface to record and display gross hole scores. All scoring rules (net, handicap adjustment, match result derivation) are deferred to later proposals.

## Goals / Non-Goals

**Goals:**
- `GET /matchups/{matchupId}/scorecard` — full scorecard payload, any league member
- `POST /pairing-slots/{slotId}/round` + `PUT /rounds/{roundId}` — atomic create/replace of Round + HoleScores, commissioner only
- `POST /seasons/{seasonId}/subs` — lightweight sub creation, commissioner only
- `Scorecard` read-only React component; `ScoreEntryDialog` commissioner form
- `LeagueConfiguration.DefaultTeeBoxId` migration
- `ManageScores` authorization capability

**Non-Goals:**
- Net / handicap-adjusted scores
- `MatchResult` derivation
- Side contests
- DNF / partial saves
- Per-hole edit endpoints
- Sub management UI (list / rename / delete)
- Mobile-optimized entry flow

## Decisions

### 1. Lazy round creation
A `Round` is created only when the commissioner saves the first set of scores for a slot. No empty `Round` rows are pre-created. Rationale: no orphan rows for unplayed slots; sub handling is cleaner (the sub identity is chosen at first save, not at pairing time).

### 2. Inline sub create inside ScoreEntryDialog
The score entry form lets the commissioner pick an existing `Sub` or create one (first name, last name, handicap) without navigating away. A dedicated "manage subs" page was rejected — too much friction for a 30-second job that almost never happens outside of score entry.

### 3. Route shape: `/matchups/[matchupId]`
The matchup has stable identity; its week is implied. `/weeks/[weekId]/matchups/[matchupId]` was considered and rejected — URL typing is not the discovery path (links from the schedule or matchup list are). Flatter is better.

### 4. All-or-nothing save
All hole scores for a round must be present to save. No partial saves; no autosave. Contract: a round either exists with a complete score set or doesn't exist at all. Simplifies validation, testing, and the data invariant. DNF is deferred (see Decision 6).

### 5. Edit replaces all scores in one transaction
`PUT /rounds/{roundId}` replaces the entire set of `HoleScore` rows (delete all + insert) and updates the round's tee box and sub assignment atomically. No per-hole patch endpoint. Mirrors the create contract — one write path, not two.

### 6. DNF is out of scope at MVP
Because of Decision 4, every `HoleScore.Strokes` will be non-null. The column stays nullable in the schema for future use, but the API rejects null strokes. Resolving DNF properly requires either partial saves (a draft state) or a per-hole DNF indicator — both deferred.

### 7. Mid-entry interruption: work is lost
No server-side draft state; no `sessionStorage` draft. Closing the dialog or navigating away discards in-progress entry. Score entry is a focused task; the loss is real but rare. `sessionStorage` is a drop-in follow-up that requires no API contract change.

### 8. `LeagueConfiguration.DefaultTeeBoxId`
Nullable FK to `TeeBox`, `ON DELETE SET NULL`. New Round rows pre-fill the tee box picker with this value. Hard-coding "the first tee box" was rejected — fragile, ambiguous. A nullable FK is the minimal, explicit fix.

### 9. `ManageScores` authorization capability
Named capability mirrors the existing `ManageMatchups` pattern. Commissioner only. Read access for any league member is already covered by the existing "member can read their league's data" rule and requires no new capability name.

### 10. Desktop-first, mobile usable
Responsive CSS, but no dedicated mobile entry flow. A mobile-optimized layout (full-screen card per hole, swipe navigation) is a worthwhile follow-up once commissioner feedback exists.

### 11. Scorecard layout: one nine at a time
The `Scorecard` component renders one 9-hole table (classic paper scorecard format). For `Full` (18-hole) weeks, two `Scorecard` instances stack — front nine above, back nine below. `Week.Nine` drives which holes render. Holes are returned from the API in play order (1–9, 10–18, or 1–18); the component doesn't need to know.

### 12. Sub route placement: `/seasons/{seasonId}/subs`
Subs are not season-scoped in the data model, but the season is the natural authorization scope for the commissioner. `POST /subs` (global) was considered — simpler, but gives up the auth scope that the season provides. `POST /seasons/{seasonId}/subs` is consistent with other commissioner endpoints and costs nothing at MVP.

### Scorecard DTO shape
The read endpoint returns a single JSON object:
```
{
  matchup: { id, week: { number, startDate, nine }, teamA: {...}, teamB: {...} },
  holes: [ { id, number, par, handicapIndex } ],       // ordered, filtered to the week's nine
  pairings: [
    {
      id,
      teeTime,
      slots: [
        {
          id,
          membership: { id, firstName, lastName, handicap },
          round: null | {
            id, teeBox: { id, name },
            sub: null | { id, firstName, lastName, handicap },
            holeScores: [ { holeId, strokes } ]        // same order as holes[]
          }
        }
      ]
    }
  ]
}
```
Keeping the hole list at the top level and `holeScores` as a parallel array (same order) lets the UI render the table with a single zip — no lookup needed per cell.

## Risks / Trade-offs

- **[Risk] Atomicity of HoleScore replace** — `PUT /rounds/{roundId}` deletes all existing `HoleScore` rows and re-inserts. If the insert fails mid-way, the transaction rolls back and the old scores are restored. EF Core's `SaveChanges` wraps the operation in a single database transaction by default. → No extra work needed; verify in tests.
- **[Risk] Stale scorecard after concurrent edits** — Two commissioners editing the same round simultaneously could race. At MVP the population is small enough that this is theoretical. → Accept; add optimistic concurrency (`rowversion` / `xmin`) if it becomes a real problem.
- **[Risk] Hole set validation is fragile** — The server must verify that the `holeScores` in the request match exactly the holes implied by `Week.Nine`. A mismatch (wrong holes, missing holes, extra holes) must be rejected 400, not silently accepted. → Covered by validation in the write endpoints; needs explicit test cases.
- **[Risk] `DefaultTeeBoxId` ON DELETE SET NULL** — If a tee box is deleted, existing `Round` rows retain their `TeeBoxId` (rounds are append-only; they reference the tee box at play time). Only `LeagueConfiguration.DefaultTeeBoxId` is set to null. UI should handle null gracefully. → Handle in the tee-box picker: fall back to the first available tee box if the default is null.

## Migration Plan

1. Add `DefaultTeeBoxId` column to `league_configurations` (nullable, `ON DELETE SET NULL`). Safe additive migration — existing rows get null, which is valid.
2. No data backfill needed. Commissioners set `DefaultTeeBoxId` via the league configuration UI (future) or SQL.
3. Rollback: drop the column. No other migrations depend on it.

## Open Questions

- **Sub route placement** — `POST /seasons/{seasonId}/subs` vs. `POST /subs`. See Decision 12. Decision is documented; open to bikeshedding.
- **`scorecard-design-questions.md`** — Mentioned in the proposal as needing to be marked resolved. Confirm it exists before the tasks phase attempts to update it.
