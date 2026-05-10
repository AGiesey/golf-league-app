## 1. Schema — DefaultTeeBoxId Migration

- [x] 1.1 Add `DefaultTeeBoxId` (nullable `Guid?`) to `LeagueConfiguration` model in `api/Models/LeagueConfiguration.cs` with navigation property to `TeeBox`
- [x] 1.2 Add EF Core configuration in `LeagueConfigurationConfiguration.cs`: nullable FK, `ON DELETE SET NULL`
- [x] 1.3 Create EF Core migration `AddDefaultTeeBoxId` — verify generated SQL is `ALTER TABLE league_configurations ADD COLUMN default_tee_box_id uuid REFERENCES tee_boxes(id) ON DELETE SET NULL`
- [x] 1.4 Update `AppDbContextModelSnapshot.cs` with the new `DefaultTeeBoxId` property on `LeagueConfiguration`
- [x] 1.5 Update `data-model.md`: add `uuid default_tee_box_id FK` to the `LEAGUECONFIGURATION` ERD block and describe the field in the `LeagueConfiguration` entity description

## 2. Authorization — ManageScores Capability

- [x] 2.1 Add `ManageScores` to the central authorization policy in `api/Program.cs` (or wherever the commissioner route group filter lives) — applied to all three write endpoints as a named capability check
- [x] 2.2 Update `docs/authorization.md` active rules: add `ManageScores` to the commissioner actions list, noting it gates Round/HoleScore writes and sub creation

## 3. API — GET /matchups/{matchupId}/scorecard

- [x] 3.1 Add the endpoint to `api/Program.cs` (outside the commissioner group — any league member can read)
- [x] 3.2 Load: matchup → week (Nine, weekNumber, startDate) → teamA/teamB → holes filtered by Nine in ascending order
- [x] 3.3 Load: pairings → slots → LeagueMembership (firstName, lastName, handicap) → optional Round (teeBox, sub, holeScores ordered by hole number matching the holes array)
- [x] 3.4 Return 404 for unknown matchupId; 403 if the caller has no membership in the matchup's league
- [x] 3.5 Verify the DTO `holeScores` array is in the same order as the top-level `holes` array (unit-test the Back nine ordering: hole 10 is index 0)

## 4. API — POST /pairing-slots/{slotId}/round

- [x] 4.1 Add endpoint under the commissioner route group in `api/Program.cs`
- [x] 4.2 Validate: slot exists in caller's season; `holeScores` count matches the week's Nine (9 or 18); hole IDs are exactly the correct set for that nine; all strokes are positive integers
- [x] 4.3 Return 409 if a `Round` already exists for this slot
- [x] 4.4 In a single `SaveChanges` transaction: create `Round` (with `CreatedBy`/`UpdatedBy` = caller membership, `LeagueMembershipId` or `SubId` exclusive, `TeeBoxId`); create all `HoleScore` rows
- [x] 4.5 Return 201 with the created round payload

## 5. API — PUT /rounds/{roundId}

- [x] 5.1 Add endpoint under the commissioner route group in `api/Program.cs`
- [x] 5.2 Return 404 if round does not exist; validate same rules as create (correct hole set, positive strokes)
- [x] 5.3 In a single transaction: delete all existing `HoleScore` rows for this round; insert new set; update `TeeBoxId`, `SubId`/`LeagueMembershipId`, `UpdatedBy`; preserve `CreatedBy`
- [x] 5.4 Return 200 with the updated round payload

## 6. API — POST /seasons/{seasonId}/subs

- [x] 6.1 Add endpoint under the commissioner route group in `api/Program.cs`
- [x] 6.2 Validate: `firstName` and `lastName` are non-blank; `handicap` is present
- [x] 6.3 Create `Sub` record and return 201 with `{ id, firstName, lastName, handicap }`

## 7. Frontend — Scorecard Route and Read-Only Component

- [x] 7.1 Create `web/app/(app)/matchups/[matchupId]/page.tsx` — server component; resolve league context, redirect if unauthenticated; fetch scorecard from `GET /matchups/{matchupId}/scorecard`; pass data to `ScorecardView` client component
- [x] 7.2 Create `web/components/scorecard/Scorecard.tsx` — renders one 9-column table: hole number row, par row, handicap-index row, one score row per slot (golfer/sub name + gross scores or empty cells)
- [x] 7.3 Implement the four slot states in `Scorecard`: not-started (empty cells), scores-present, sub-played (sub name in label), and full-18 (two stacked instances)
- [x] 7.4 Create `web/components/scorecard/ScorecardView.tsx` — client component that wraps `Scorecard`(s), receives full scorecard payload, handles the `Full`-week two-table layout, and passes `isCommissioner` down for entry affordances

## 8. Frontend — ScoreEntryDialog

- [x] 8.1 Create `web/components/scorecard/ScoreEntryDialog.tsx` — dialog form with 9 or 18 numeric hole inputs (min 1, integers only), tee box select (defaulted to `LeagueConfiguration.DefaultTeeBoxId` if present), `SubPickerInline`, Save/Cancel; Save disabled until all inputs valid
- [x] 8.2 Create `web/components/scorecard/SubPickerInline.tsx` — toggle between "select existing sub" (select element populated from `GET /seasons/{seasonId}/subs` or passed as prop) and "create new sub" inline form (firstName, lastName, handicap); on save, calls `POST /seasons/{seasonId}/subs` first then passes the new sub id up
- [x] 8.3 Wire `ScoreEntryDialog` create path: on submit call `POST /pairing-slots/{slotId}/round`; on 201 close dialog and refresh scorecard
- [x] 8.4 Wire `ScoreEntryDialog` edit path: pre-populate inputs with existing scores; on submit call `PUT /rounds/{roundId}`; on 200 close dialog and refresh scorecard
- [x] 8.5 Render "Add round" button per slot (no round) and "Edit round" button per slot (has round) only when `isCommissioner` is true; hide completely for non-commissioners

## 9. Design Route Examples

- [x] 9.1 Add `Scorecard` examples to `/design`: all four states (not started, partial, complete, sub-played); use realistic hole/par/handicap data
- [x] 9.2 Add `ScoreEntryDialog` examples to `/design`: empty form, valid form (all inputs filled), and inline sub-create expanded

## 10. Docs and Cross-Cutting

- [x] 10.1 Update `docs/design-system.md` (if it exists as a doc file) or the design-system spec component inventory with `Scorecard` and `ScoreEntryDialog`
- [x] 10.2 If `scorecard-design-questions.md` exists in the docs or openspec directories, add a note at the top marking it resolved and linking to this change
- [x] 10.3 Verify the API compiles cleanly with a Docker build after all API changes are complete
