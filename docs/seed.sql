-- Golf League App — Seed Template
--
-- Run this script against the running database to bootstrap a course, league,
-- season, and golfer accounts for local development.
--
-- Usage:
--   docker exec -i golf-league-app-postgres-1 psql -U golf -d golfleague < docs/seed.sql
--
-- You can also pipe it in from the project root:
--   cat docs/seed.sql | docker exec -i golf-league-app-postgres-1 psql -U golf -d golfleague

BEGIN;

-- ============================================================
-- Course
-- ============================================================
INSERT INTO courses (id, name, timezone, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Pebble Creek Golf Club',
    'America/Chicago',
    NOW(),
    NOW()
);

-- ============================================================
-- Tee Boxes
-- ============================================================
INSERT INTO tee_boxes (id, course_id, name, created_at, updated_at) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Blue',   NOW(), NOW()),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'White',  NOW(), NOW());

-- ============================================================
-- Holes (9-hole course)
-- ============================================================
INSERT INTO holes (id, course_id, number, par, handicap_index, created_at, updated_at) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 1, 4, 1, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 2, 3, 7, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 3, 5, 3, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 4, 4, 5, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 5, 3, 9, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 6, 4, 2, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 7, 5, 4, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 8, 4, 6, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 9, 3, 8, NOW(), NOW());

-- ============================================================
-- League
-- ============================================================
INSERT INTO leagues (id, course_id, name, day_of_week, default_round_length, created_at, updated_at)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Wednesday Night League',
    3,   -- 0=Sunday, 1=Monday, ... 3=Wednesday
    9,
    NOW(),
    NOW()
);

-- ============================================================
-- League Configuration
-- ============================================================
INSERT INTO league_configurations (id, league_id, handicap_system, subs_allowed, created_at, updated_at)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'WHS',
    true,
    NOW(),
    NOW()
);

-- ============================================================
-- Season
-- ============================================================
INSERT INTO seasons (id, league_id, year, start_date, end_date, created_at, updated_at)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    2026,
    '2026-05-06',
    '2026-08-26',
    NOW(),
    NOW()
);

-- ============================================================
-- Golfers
-- ============================================================
-- external_auth_id is set to the golfer's own UUID for mock auth.
-- The MockAuthProvider returns the cookie value as ExternalAuthId,
-- so seeded golfers must have external_auth_id = their own id.
INSERT INTO golfers (id, course_id, first_name, last_name, email, external_auth_id, created_at, updated_at) VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'Alice',
        'Anderson',
        'alice@example.com',
        '10000000-0000-0000-0000-000000000001',
        NOW(),
        NOW()
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'Bob',
        'Baker',
        'bob@example.com',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        NOW()
    );

-- ============================================================
-- League Memberships
-- ============================================================
INSERT INTO league_memberships (id, golfer_id, season_id, is_commissioner, created_at, updated_at) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000001',
        true,
        NOW(),
        NOW()
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'f0000000-0000-0000-0000-000000000001',
        false,
        NOW(),
        NOW()
    );

COMMIT;
