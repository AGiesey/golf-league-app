## Why

The data model has carried `Round` and `HoleScore` since the initial schema, but there is no UI or API surface to enter or view scores. Golfers cannot see hole-by-hole results and commissioners have no way to record them.

## What Changes

- Add `LeagueConfiguration.DefaultTeeBoxId` — nullable FK to `TeeBox`; new `Round` rows default to this tee box. Requires one EF Core migration.
- New API endpoints (gross scores, commissioner writes, any-member reads):
  - `GET /matchups/{matchupId}/scorecard` — read scorecard data for a matchup
  - `POST /pairing-slots/{slotId}/round` — create round + hole scores (atomic)
  - `PUT /rounds/{roundId}` — replace all hole scores for an existing round
  - `POST /seasons/{seasonId}/subs` — inline sub creation during score entry
- New frontend route `/matchups/[matchupId]` with a read-only `Scorecard` component and a commissioner-only `ScoreEntryDialog`
- New `ManageScores` authorization capability gating all write endpoints
- Design route additions: `Scorecard` and `ScoreEntryDialog` examples

**Intentionally out of scope:**
- Net/handicap-adjusted scoring (future scoring-service proposal)
- `MatchResult` derivation (separate proposal)
- Side contests (separate proposals per type)
- DNF / no-score / partial saves (deferred; see design decisions)

## Capabilities

### New Capabilities

- `scorecard-read`: `GET /matchups/{matchupId}/scorecard` endpoint and the `Scorecard` read-only UI component — hole-by-hole gross scores for a matchup, all four slot states (not started / partial / complete / sub)
- `score-entry`: Commissioner-only `POST` and `PUT` endpoints for `Round`/`HoleScore`, the `ScoreEntryDialog` form component, and the `SubPickerInline` inline sub-create affordance
- `sub-create`: `POST /seasons/{seasonId}/subs` endpoint for lightweight sub creation during score entry
- `manage-scores-authz`: The `ManageScores` named authorization capability applied to all score write endpoints

### Modified Capabilities

- `course-and-league-entities`: `LeagueConfiguration` gains `DefaultTeeBoxId` — a nullable FK to `TeeBox`. ERD and entity description change.
- `design-system`: New `Scorecard` and `ScoreEntryDialog` components added to the component inventory.

## Impact

- **API**: 4 new endpoints; one new EF Core migration (`DefaultTeeBoxId` on `league_configurations`)
- **Frontend**: new route `app/(app)/matchups/[matchupId]/page.tsx`; new components in `web/components/scorecard/`
- **Authorization**: new `ManageScores` capability in the central policy
- **Docs**: `data-model.md`, `authorization.md`, `design-system.md` (component inventory)
- **No breaking changes** to existing API contracts
