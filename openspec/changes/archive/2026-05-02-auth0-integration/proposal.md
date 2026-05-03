## Why

The foundational layer is in place: domain entities exist, a mock auth provider lets developers log in as any seeded golfer, and `GET /me` returns the authenticated golfer's profile. The `Auth0AuthProvider` stub, however, throws `NotImplementedException`, and the mock provider bypasses real token handling entirely by reading a plain cookie. Golfers cannot log in via Auth0, and the development auth path has nothing in common with the production one — any JWT validation bug in `Auth0AuthProvider` would be invisible until production.

This change closes that gap. It wires real Auth0 login, introduces the first-time-login linking flow that connects an Auth0 identity to a pre-registered golfer record, and upgrades the mock provider to issue actual JWTs so the frontend-to-API contract is identical in both environments.

## What Changes

- Replace the `Auth0AuthProvider` stub with a working implementation that validates JWTs against Auth0's JWKS endpoint and extracts `sub` and `email` claims
- Upgrade `MockAuthProvider` from cookie-based to JWT-issuing: the mock now mints and validates HMAC-signed JWTs locally, giving development the same Bearer-token contract as production
- Update `IAuthProvider` and the golfer-resolution middleware to work with Bearer tokens extracted from the `Authorization` header (replacing the mock-cookie path)
- Add the first-time-login linking flow: when a valid JWT arrives with no matching `ExternalAuthId`, the API matches the JWT's `email` claim against a pre-registered `Golfer` record at the configured default course and writes `ExternalAuthId` to complete the link
- Define the exact response contracts for all four auth states (missing token, invalid token, valid token with no linked Golfer, valid token with linked Golfer)
- Add `@auth0/nextjs-auth0` to the Next.js app and wire the login/callback flow; store tokens in an httpOnly session cookie; forward as Bearer tokens on server-side API calls
- Update the mock `/dev/login` page to issue a mock JWT via the upgraded provider and set the same session cookie structure used by real Auth0 logins
- Add a startup guard that prevents `MockAuthProvider` from running in a production environment

## Capabilities

### New Capabilities

- `auth0-login-flow`: Next.js login and callback flow using `@auth0/nextjs-auth0`; Auth0 tokens stored in an encrypted httpOnly session cookie; extracted server-side and forwarded as `Authorization: Bearer <token>` on requests to the ASP.NET Core API
- `auth0-provider`: Working `Auth0AuthProvider` implementation that validates JWTs against Auth0's JWKS endpoint (`https://{domain}/.well-known/jwks.json`), validates `iss` and `aud`, and returns an `AuthResult` containing `ExternalAuthId` (from `sub`) and `Email`
- `mock-token-issuer`: Upgraded `MockAuthProvider` that mints HMAC-SHA256-signed JWTs and validates them locally; same Bearer-token contract as Auth0 in development; no external calls
- `first-time-login-linking`: Middleware logic that, on first successful login, matches the JWT's `email` claim against a pre-registered `Golfer` row with a null `ExternalAuthId` at the configured course and writes the `ExternalAuthId` to complete the link
- `auth-error-contracts`: Defined JSON response bodies for the four auth states; 401 for missing or invalid tokens, 403 for authenticated but unregistered users

### Modified Capabilities

- `golfer-auth`: Updated to use Bearer tokens extracted from the `Authorization` header; golfer-resolution middleware updated to run the four-state auth flow; `AuthResult` gains an `Email` field; `IAuthProvider.ValidateTokenAsync` replaces the previous `ResolveAsync(HttpContext)` signature

## Impact

- No database schema change — `Golfer.ExternalAuthId` already exists and its unique constraints already match the linking requirements; no migration needed
- The `mock-golfer-id` cookie approach from the previous proposal is fully replaced; no backwards-compatibility shim
- Introduces a dependency on `@auth0/nextjs-auth0` in the web layer and JWT validation packages (`Microsoft.IdentityModel.Tokens`, `System.IdentityModel.Tokens.Jwt`) in the API
- Introduces an Auth0 tenant dependency for production deployments; local development with the mock provider continues to require no external accounts
- Updates `.env.example` and `web/.env.local.example` with new Auth0 and mock configuration variables
- `docs/data-model.md` does not require changes; all fields referenced by this proposal already exist
