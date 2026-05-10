## Context

The `Week` entity currently carries `Type` (Regular / FunWeek / MakeupDay) stored as a string-backed enum via EF Core's `HasConversion<string>()`. There is no field for which holes are played. Most leagues in this app are 9-hole leagues that alternate front and back each week; without this field the app cannot later render the correct scorecard or display "Front 9 · Week 3" in any UI.

The existing `WeekType` enum and its EF Core configuration (`WeekConfiguration`) serve as the direct template for this change.

## Goals / Non-Goals

**Goals:**
- Add a `NineType` enum (`Front`, `Back`, `Full`) and a `Nine` property to the `Week` model.
- Persist it as a string in the database using the same pattern as `WeekType`.
- Produce a safe EF Core migration with a sensible default for existing rows.
- Include `nine` in the `/commissioner/season/schedule` response so clients have the data when it's needed.
- Update `data-model.md`, `season-setup.md`, and `league-setup-sql.md`.

**Non-Goals:**
- A UI to edit `Week.Nine` (deferred to course admin UI).
- Auto-rotation logic (seed SQL is authoritative).
- Enforcing that a 9-hole league only schedules Front/Back weeks.
- Handling courses where the front 9 isn't holes 1–9.

## Decisions

### Use a separate `NineType` enum rather than extending `WeekType`
`WeekType` models the competitive format of a week (Regular, FunWeek, MakeupDay). Which holes are played is orthogonal — a FunWeek can be Front or Full. Merging both into one enum would create a combinatorial explosion (`RegularFront`, `RegularBack`, `FunWeekFull`, …). A separate `NineType` keeps both concepts independent and composable.

### String-backed EF Core conversion, same as `WeekType`
`HasConversion<string>()` with `HasDefaultValue(NineType.Front)` in `WeekConfiguration` mirrors the existing pattern. The stored strings (`"Front"`, `"Back"`, `"Full"`) are human-readable in the database and survive enum renames via migration if needed. Alternative: integer enum — rejected because string values are easier to inspect and the performance difference is negligible for this volume.

### Default existing rows to `Front`
There are no production rows. Dev environments are reset frequently. `Front` is the most common starting value for 9-hole leagues and is semantically the safest pick ("you played the front 9" is unlikely to cause confusion if a dev row is wrong). The migration comment documents this choice explicitly.

### Include `nine` in the schedule API response
The `/commissioner/season/schedule` endpoint already serializes `type`. Adding `nine = w.Nine.ToString()` is additive and non-breaking — existing callers that ignore unknown fields are unaffected, and the web client (`MatchupsClient.tsx`) already reads `type` from this response and can ignore `nine` for now. Adding it now avoids a later migration of the API contract when the scorecard proposal arrives.

## Risks / Trade-offs

- **Courses with non-standard hole numbering** — The Front/Back enum assumes holes 1–9 are the front and 10–18 are the back. Courses that number holes differently (e.g., starting from the 10th) aren't supported. Documented as a known limitation in `data-model.md`; a future `model-week-holes-played` proposal can supersede the enum with an explicit hole list.
- **Migration default correctness** — If any dev Week rows should be `Back` or `Full`, the default of `Front` will be wrong for those rows. Acceptable: dev data is disposable, and the migration is documented.

## Migration Plan

1. Add `NineType` enum and `Nine` property to `Week.cs`.
2. Add `Nine` configuration to `WeekConfiguration.cs` (string conversion, default `Front`).
3. Run `dotnet ef migrations add AddWeekNine` — EF Core generates `ALTER TABLE weeks ADD COLUMN nine TEXT NOT NULL DEFAULT 'Front'`.
4. No rollback complexity: the column is additive, non-nullable with a default, and no existing code reads it.

## Open Questions

- None blocking implementation. The course admin UI that will expose a `Nine` editor is a separate proposal.
