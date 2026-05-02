## Why

The existing seed data uses placeholder golfers (Alice, Bob) with fake emails that cannot be used for real Auth0 authentication testing. Replacing them with real email addresses unblocks Phase 1: validating the end-to-end Auth0 login → golfer linking flow before building further features.

## What Changes

- Remove placeholder golfers Alice Anderson and Bob Baker from `docs/seed.sql`
- Add 8 real dev golfers: Adam Giesey (commissioner) + 7 yopmail placeholder golfers (regular members)
- All golfers seeded with `external_auth_id = NULL`; linking happens automatically on first Auth0 login via email match

## Capabilities

### New Capabilities

- `dev-golfer-seed`: Seed data for 8 dev golfers with real email addresses, one commissioner and seven regular league members, suitable for real Auth0 authentication testing

### Modified Capabilities

- `golfer-auth`: The email-based first-login linking behavior is unchanged, but the seed now provides real emails that Auth0 can match against

## Impact

- `docs/seed.sql`: golfer and league_membership rows replaced
- No API or schema changes
- Mock auth dev login will show the 8 new golfers instead of Alice/Bob
