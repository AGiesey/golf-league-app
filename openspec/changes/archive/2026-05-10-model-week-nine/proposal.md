## Why

A `Week` has no field recording which holes are played. For 9-hole leagues — the common case — this prevents the app from knowing which 9 holes apply to an upcoming week, making it impossible to render the right scorecard or store the front/back rotation as a first-class schedule property.

## What Changes

- Add a `Nine` enum (`Front`, `Back`, `Full`) to the `Week` entity.
- `Front` — holes 1–9 are played this week.
- `Back` — holes 10–18 are played this week.
- `Full` — all 18 holes are played this week.
- The field is set at week-creation time (season setup / seed SQL). It is schedule data, not gameplay data.
- Alternating Front/Back is a convention for 9-hole leagues; the model permits any sequence.
- The model also permits a 9-hole league to schedule a `Full` week or an 18-hole league to schedule `Front`/`Back` weeks (special formats happen).
- Add an EF Core migration with a safe default for existing rows.
- Update `data-model.md` (ERD + entity description + known limitations note).
- Update `season-setup.md` (schedule narrative + open questions).
- Update `league-setup-sql.md` (Week-seeding example with `Nine`).

**Out of scope:**
- UI to edit `Week.Nine` — deferred to the course admin UI proposal.
- Auto-rotation logic — seed SQL writes whatever the league wants.
- Enforcing that 9-hole leagues only use Front/Back — not a constraint.
- Courses where the front 9 isn't holes 1–9 — accepted limitation; a future `model-week-holes-played` proposal could supersede the enum.

## Capabilities

### New Capabilities

- `week-nine`: The `Nine` field on `Week` tracks which holes are played each week using a three-value enum (Front / Back / Full).

### Modified Capabilities

- `schedule-tab`: The schedule display may eventually surface `Nine` alongside each week; requirements update to note the field exists on the week record (no UI change yet, but the spec should reflect the data model).

## Impact

- **API / database**: New `Nine` column on `weeks` table; EF Core enum; new migration.
- **Seed SQL**: `league-setup-sql.md` example must include `nine` on week inserts.
- **Docs**: `data-model.md`, `season-setup.md`, `league-setup-sql.md`.
- **No breaking changes** to existing API responses at MVP — `Week` is not currently serialized to the client in a way that would break callers if the field is added.
