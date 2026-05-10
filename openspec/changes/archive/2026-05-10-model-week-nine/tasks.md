## 1. API — NineType Enum and Week.Nine Property

- [x] 1.1 Add `NineType` enum (`Front`, `Back`, `Full`) to `api/Models/Week.cs` alongside the existing `WeekType` enum
- [x] 1.2 Add `Nine` property of type `NineType` (default `Front`) to the `Week` class in `api/Models/Week.cs`
- [x] 1.3 Add `Nine` configuration to `api/Data/Configurations/WeekConfiguration.cs` — `HasConversion<string>()` and `HasDefaultValue(NineType.Front)`, following the same pattern as `Type`

## 2. API — EF Core Migration

- [x] 2.1 Run `dotnet ef migrations add AddWeekNine` inside the `api/` directory to generate the migration; verify the generated SQL adds a `nine TEXT NOT NULL DEFAULT 'Front'` column on `weeks`
- [x] 2.2 Add a comment in the migration file explaining the default (`Front` is a safe default for dev rows; no production data exists)

## 3. API — Schedule Endpoint

- [x] 3.1 Add `nine = w.Nine.ToString()` to the anonymous projection in `GET /commissioner/season/schedule` in `api/Program.cs`

## 4. Docs — data-model.md

- [x] 4.1 Add `string nine` to the `WEEK` block in the ERD
- [x] 4.2 Add a paragraph to the `Week` entity description explaining the `Nine` field and the Front/Back rotation pattern
- [x] 4.3 Add a note to the "Known constraints and accepted limitations" section documenting that the model assumes holes 1–9 are the front nine and 10–18 are the back nine; courses with non-standard numbering are not supported

## 5. Docs — season-setup.md

- [x] 5.1 Update the Schedule requirement narrative to mention that weeks carry a `Nine` value indicating which holes are played
- [x] 5.2 Add a note in the open questions / deferred decisions section that editing `Week.Nine` via UI is part of the deferred course admin work

## 6. Docs — league-setup-sql.md

- [x] 6.1 Add a Week-seeding example to Step 4 (or as its own Step 5) showing `INSERT INTO weeks` with `nine` set, using an alternating Front/Back pattern as the canonical example; document `Front`, `Back`, and `Full` as the valid values
