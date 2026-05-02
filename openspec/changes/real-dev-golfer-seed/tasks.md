## 1. Update seed.sql

- [x] 1.1 Remove Alice Anderson and Bob Baker golfer rows and their league membership rows
- [x] 1.2 Add Adam Giesey golfer row (adamgiesey@gmail.com, external_auth_id = NULL)
- [x] 1.3 Add 7 yopmail golfer rows (external_auth_id = NULL on all)
- [x] 1.4 Add league membership for Adam Giesey with is_commissioner = true
- [x] 1.5 Add league memberships for all 7 yopmail golfers with is_commissioner = false

## 2. Re-seed local database

- [x] 2.1 Clear existing golfer and league_membership rows from local DB
- [x] 2.2 Run updated docs/seed.sql against local Docker Postgres

## 3. Verify mock auth

- [x] 3.1 Start app in mock auth mode and confirm /dev/login shows all 8 new golfers
- [x] 3.2 Select Adam Giesey and confirm /me loads correctly

## 4. Verify Auth0 auth

- [x] 4.1 Switch to auth0 mode in .env.local and restart
- [x] 4.2 Log in with adamgiesey@gmail.com and confirm external_auth_id is written to the DB
- [x] 4.3 Log in with at least one yopmail account and confirm linking works
