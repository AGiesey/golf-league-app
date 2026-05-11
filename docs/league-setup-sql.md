# Setting Up a League via SQL

This guide walks through bootstrapping a new league from scratch. All steps must be done in order — each table depends on the one before it.

**Connect to the database:**
```bash
docker exec -it golf-league-app-postgres-1 psql -U golf -d golfleague
```

Or pipe a SQL file in:
```bash
cat your-setup.sql | docker exec -i golf-league-app-postgres-1 psql -U golf -d golfleague
```

---

## Step 1 — Course

One course per physical golf club. Golfers belong to a course; leagues and seasons are scoped to a course.

```sql
INSERT INTO courses (id, name, timezone, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Your Club Name',
    'America/Chicago',   -- IANA timezone name
    NOW(), NOW()
);
```

Note the `id` — you'll reference it in every subsequent step. You can use a fixed UUID to make the script reproducible:
```sql
-- Use a fixed UUID for a repeatable script:
INSERT INTO courses (id, name, timezone, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Your Club Name', 'America/Chicago', NOW(), NOW());
```

### Tee Boxes

At least one tee box is expected per course. Add as many as your course uses.

```sql
INSERT INTO tee_boxes (id, course_id, name, created_at, updated_at) VALUES
    (gen_random_uuid(), '<course_id>', 'Blue',  NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 'White', NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 'Red',   NOW(), NOW());
```

### Holes

One row per hole. `handicap_index` is the stroke index (1 = hardest, 18 = easiest). For a 9-hole course, use 1–9.

```sql
INSERT INTO holes (id, course_id, number, par, handicap_index, created_at, updated_at) VALUES
    (gen_random_uuid(), '<course_id>', 1,  4, 1, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 2,  3, 7, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 3,  5, 3, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 4,  4, 5, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 5,  3, 9, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 6,  4, 2, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 7,  5, 4, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 8,  4, 6, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 9,  3, 8, NOW(), NOW());
```

---

## Step 2 — Golfers

Golfers are pre-provisioned by the commissioner. Each golfer belongs to exactly one course. `external_auth_id` is left NULL — it gets filled automatically the first time the golfer signs in via Auth0.

```sql
INSERT INTO golfers (id, course_id, first_name, last_name, email, external_auth_id, created_at, updated_at) VALUES
    (gen_random_uuid(), '<course_id>', 'Adam',  'Giesey',    'adamgiesey@gmail.com',          NULL, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 'Chris', 'Calloway',  'chris@example.com',             NULL, NOW(), NOW()),
    (gen_random_uuid(), '<course_id>', 'Dana',  'Fairway',   'dana@example.com',              NULL, NOW(), NOW());
```

**Constraints:**
- `(course_id, email)` must be unique — a person can only appear once per course.
- `email` must match the address the golfer will use to sign in via Auth0; that's how the first-login link happens.

---

## Step 3 — League

A league belongs to a course and plays on a fixed day of the week.

```sql
INSERT INTO leagues (id, course_id, name, day_of_week, default_round_length, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '<course_id>',
    'Wednesday Night League',
    3,    -- day_of_week: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
    9,    -- default_round_length: holes per round (typically 9 or 18)
    NOW(), NOW()
);
```

### League Configuration

Every league needs exactly one configuration row.

```sql
INSERT INTO league_configurations (id, league_id, handicap_system, subs_allowed, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '<league_id>',
    'WHS',   -- handicap system name (e.g. 'WHS', 'USGA', 'Custom')
    true,    -- whether substitute golfers are allowed
    NOW(), NOW()
);
```

---

## Step 4 — Season

A season scopes a time window for play. The context resolution system uses `start_date` and `end_date` to determine which season is "active":

- A season is **active** if `start_date <= today <= end_date`.
- If no active season exists, the system falls back to the **most recently ended** season so the dashboard stays useful in the off-season.
- A season with `start_date` in the future is **not yet active** — golfers will see "no leagues" until start_date arrives.

```sql
INSERT INTO seasons (id, league_id, year, start_date, end_date, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '<league_id>',
    2026,
    '2026-04-30',   -- must be on or before today for golfers to see the dashboard
    '2026-08-26',
    NOW(), NOW()
);
```

---

## Step 5 — Weeks

Each `Week` belongs to a season and carries:
- `week_number` — 1-based, determines display order
- `start_date` — the calendar date play occurs
- `type` — `Regular`, `FunWeek`, or `MakeupDay`
- `nine` — `Front`, `Back`, or `Full` (which holes are played this week)

Valid `nine` values:
- `'Front'` — holes 1–9
- `'Back'` — holes 10–18
- `'Full'` — all 18 holes

The canonical pattern for a 9-hole league is alternating Front/Back weeks:

```sql
INSERT INTO weeks (id, season_id, week_number, start_date, type, nine, created_at, updated_at) VALUES
    (gen_random_uuid(), '<season_id>', 1,  '2026-04-30', 'Regular', 'Front', NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 2,  '2026-05-07', 'Regular', 'Back',  NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 3,  '2026-05-14', 'Regular', 'Front', NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 4,  '2026-05-21', 'Regular', 'Back',  NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 5,  '2026-05-28', 'Regular', 'Front', NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 6,  '2026-06-04', 'Regular', 'Back',  NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 7,  '2026-06-11', 'Regular', 'Front', NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 8,  '2026-06-18', 'Regular', 'Back',  NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 9,  '2026-06-25', 'Regular', 'Front', NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 10, '2026-07-02', 'Regular', 'Back',  NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 11, '2026-07-09', 'Regular', 'Front', NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 12, '2026-07-16', 'Regular', 'Back',  NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 13, '2026-07-23', 'Regular', 'Front', NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 14, '2026-07-30', 'Regular', 'Back',  NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 15, '2026-08-06', 'Regular', 'Front', NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 16, '2026-08-13', 'Regular', 'Back',  NOW(), NOW()),
    (gen_random_uuid(), '<season_id>', 17, '2026-08-20', 'FunWeek', 'Full',  NOW(), NOW());
```

For an 18-hole league, use `'Full'` for every week.

---

## Step 6 — League Memberships

One row per golfer per season. This is where `is_commissioner` is set — it's per-membership, not per-person.

```sql
INSERT INTO league_memberships (id, golfer_id, season_id, is_commissioner, created_at, updated_at) VALUES
    (gen_random_uuid(), '<golfer_id_adam>',  '<season_id>', true,  NOW(), NOW()),
    (gen_random_uuid(), '<golfer_id_chris>', '<season_id>', false, NOW(), NOW()),
    (gen_random_uuid(), '<golfer_id_dana>',  '<season_id>', false, NOW(), NOW());
```

**Note:** `handicap` is nullable — leave it NULL at season start and update it once established.

---

## Useful lookup queries

```sql
-- Find a course ID
SELECT id, name FROM courses;

-- Find golfer IDs
SELECT id, first_name, last_name, email FROM golfers WHERE course_id = '<course_id>';

-- Find a league ID
SELECT id, name FROM leagues WHERE course_id = '<course_id>';

-- Find a season ID
SELECT id, year, start_date, end_date FROM seasons WHERE league_id = '<league_id>';

-- Check who's in a season
SELECT g.first_name, g.last_name, lm.is_commissioner
FROM league_memberships lm
JOIN golfers g ON g.id = lm.golfer_id
WHERE lm.season_id = '<season_id>'
ORDER BY g.last_name;
```

---

## Adding a new season to an existing league

If the course, league, golfers, and configuration already exist, you only need Steps 4 and 5:

```sql
-- New season
INSERT INTO seasons (id, league_id, year, start_date, end_date, created_at, updated_at)
VALUES (gen_random_uuid(), '<existing_league_id>', 2027, '2027-05-01', '2027-08-31', NOW(), NOW());

-- Re-enroll golfers (copy from last season as a starting point)
INSERT INTO league_memberships (id, golfer_id, season_id, is_commissioner, created_at, updated_at)
SELECT gen_random_uuid(), golfer_id, '<new_season_id>', is_commissioner, NOW(), NOW()
FROM league_memberships
WHERE season_id = '<old_season_id>'
  AND archived_at IS NULL;
```

---

## Soft deletes

Golfers, seasons, and memberships use soft deletes via `archived_at`. To remove someone from a season without hard-deleting their data:

```sql
UPDATE league_memberships
SET archived_at = NOW(), updated_at = NOW()
WHERE golfer_id = '<golfer_id>' AND season_id = '<season_id>';
```

The context resolution query filters `WHERE archived_at IS NULL`, so archived rows are invisible to the app.
