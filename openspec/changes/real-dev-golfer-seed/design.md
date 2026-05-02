## Context

`docs/seed.sql` currently seeds two placeholder golfers (Alice Anderson, Bob Baker) with fake emails. These cannot be used for Auth0 authentication because Auth0 sends real emails to real addresses. The seed script is run once against the local Docker Postgres instance to bootstrap a usable dev environment.

## Goals / Non-Goals

**Goals:**
- Replace placeholder golfers with 8 real dev golfers (1 commissioner, 7 regular members)
- Use `adamgiesey@gmail.com` for the commissioner so it carries through to production
- Use yopmail addresses for the remaining 7 (no account creation required, inbox accessible at yopmail.com)
- Keep `external_auth_id = NULL` on all rows — Auth0 linking happens on first login

**Non-Goals:**
- Schema changes — no new columns or tables
- API changes
- Any change to the Auth0 linking logic in `GolferContextMiddleware`
- Automated re-seeding or migration tooling

## Decisions

**Yopmail for placeholder golfers** — yopmail.com provides publicly accessible inboxes with no registration. Any address at `@yopmail.com` works immediately. Acceptable for dev-only accounts that will never hold sensitive data.

**Commissioner is Adam Giesey** — `adamgiesey@gmail.com` is the intended production super-user. Using this email in dev seed ensures the first-login Auth0 link produces the correct commissioner record without manual DB fixup.

**Replace Alice and Bob entirely** — they were never used in production and mock auth works with any golfer in the DB, so there is no reason to keep them alongside the new golfers.

## Risks / Trade-offs

- **Yopmail inboxes are public** — anyone who knows the address can read the inbox. These accounts must never hold real data or be given production credentials. Dev only.
- **Re-seeding wipes progress** — running the seed script a second time will fail on duplicate IDs. Developers need to clear the relevant tables first or the script needs to be idempotent. This is a pre-existing limitation, not introduced by this change.

## Migration Plan

1. Wipe existing golfer and league_membership rows from local DB (or drop and recreate)
2. Run updated `docs/seed.sql`
3. Log in via Auth0 with each account to trigger the email-based linking
