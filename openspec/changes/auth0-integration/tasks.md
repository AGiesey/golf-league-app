## 1. API — Interface and AuthResult Update

- [ ] 1.1 Add `Email` property to `api/Auth/AuthResult.cs` — update record to `AuthResult(string ExternalAuthId, string Email)`
- [ ] 1.2 Replace `ResolveAsync(HttpContext context)` with `ValidateTokenAsync(string bearerToken)` on `api/Auth/IAuthProvider.cs`

## 2. API — Packages

- [ ] 2.1 Add `Microsoft.IdentityModel.Tokens` and `System.IdentityModel.Tokens.Jwt` NuGet packages to `api/GolfLeagueApi.csproj`
- [ ] 2.2 Add `Microsoft.Extensions.Caching.Memory` NuGet package (for JWKS caching in `Auth0AuthProvider`)

## 3. API — Upgraded MockAuthProvider

- [ ] 3.1 Rewrite `api/Auth/MockAuthProvider.cs` to implement `ValidateTokenAsync`: validate the Bearer token as an HMAC-SHA256 JWT using `Auth:Mock:SigningKey`; verify `iss=golf-league-mock`, `aud=golf-league-api`, and `exp`; return `AuthResult(sub, email)` on success, `null` on failure
- [ ] 3.2 Add `IssueTokenAsync(Guid golferId) → Task<string>` method to `MockAuthProvider` (not on the interface): look up the golfer, set `sub` to `mock|{golferId}`, `email` to the golfer's registered email, `iss=golf-league-mock`, `aud=golf-league-api`, `exp` = 24 hours; sign with `Auth:Mock:SigningKey`; return the signed JWT string
- [ ] 3.3 Register `MockAuthProvider` in DI as both `IAuthProvider` and as the concrete `MockAuthProvider` type so dev endpoints can receive it directly

## 4. API — Auth0AuthProvider (real implementation)

- [ ] 4.1 Implement `Auth0AuthProvider.ValidateTokenAsync` in `api/Auth/Auth0AuthProvider.cs`: fetch JWKS from `https://{Auth:Auth0:Domain}/.well-known/jwks.json` (cache for 1 hour using `IMemoryCache`); validate JWT signature, `iss=https://{Auth:Auth0:Domain}/`, `aud={Auth:Auth0:Audience}`, and `exp`; extract `ExternalAuthId` from the `sub` claim and `Email` from the `https://golf-league-app/email` custom claim; return `AuthResult(sub, email)` on success, `null` on failure
- [ ] 4.2 Add constructor injection of `IOptions<Auth0Options>` and `IMemoryCache` to `Auth0AuthProvider`; add `api/Auth/Auth0Options.cs` record (`Domain`, `Audience`)
- [ ] 4.3 Create `docs/auth0-setup.md` documenting the required one-time manual Auth0 tenant configuration: (1) create the API resource with the audience identifier matching `Auth:Auth0:Audience`; (2) create a Single Page Application, configure allowed callback URLs (`{AUTH0_BASE_URL}/api/auth/callback`) and logout URLs (`{AUTH0_BASE_URL}`); (3) build and deploy the Post Login Action with the code from design.md D3 that adds the `https://golf-league-app/email` claim to the access token; (4) wire the Action into the Login flow between "Start" and "Complete"

## 5. API — Golfer Resolution Middleware Update

- [ ] 5.1 Update `api/Middleware/GolferContextMiddleware.cs`: extract the Bearer token from the `Authorization` header; reject missing or malformed headers with 401 `{ "error": "missing_token" }`; call `IAuthProvider.ValidateTokenAsync(token)`; on null result, log the specific failure reason at Warning level and reject with 401 `{ "error": "invalid_token" }` (the specific reason must NOT be included in the response body)
- [ ] 5.2 Update `GolferContextMiddleware` with the first-time-login linking flow: after a failed `ExternalAuthId` lookup, query by `email` and `course_id = App:DefaultCourseId` where `external_auth_id IS NULL` and `archived_at IS NULL`; on match, write `ExternalAuthId` inside a database transaction and attach the Golfer to context; on no match, return 403 `{ "error": "not_registered", "email": "<email from AuthResult>" }`
- [ ] 5.3 Update `api/Extensions/HttpContextExtensions.cs` — `RequireGolfer()` error bodies must use `{ "error": "missing_token" }` and `{ "error": "invalid_token" }` exactly as specified in design.md D8
- [ ] 5.4 Add `api/Auth/AppOptions.cs` record (`DefaultCourseId`) and wire it into `GolferContextMiddleware` via `IOptions<AppOptions>`

## 6. API — Startup Configuration and Guards

- [ ] 6.1 Add `api/Auth/MockAuthOptions.cs` record (`SigningKey`) and bind it from `Auth:Mock` in configuration
- [ ] 6.2 Update `Program.cs` DI registration to bind `Auth0Options` from `Auth:Auth0`, `MockAuthOptions` from `Auth:Mock`, and `AppOptions` from `App`; register the correct `IAuthProvider` implementation based on `Auth:Provider` value
- [ ] 6.3 Add startup validation in `Program.cs` (before `app.Run()`): throw `InvalidOperationException` if `Auth:Provider=Mock` and `ASPNETCORE_ENVIRONMENT=Production`
- [ ] 6.4 Add startup validation: throw `InvalidOperationException` if `Auth:Provider=Auth0` and `Auth:Auth0:Domain` or `Auth:Auth0:Audience` is missing or empty
- [ ] 6.5 Add startup validation: throw `InvalidOperationException` if `App:DefaultCourseId` is missing or is not a parseable GUID
- [ ] 6.6 Update `appsettings.json` default section structure to match the new `Auth` / `App` shape (with empty placeholder values and comments); update `.env.example` with all new variables (`Auth__Provider`, `Auth__Auth0__Domain`, `Auth__Auth0__Audience`, `Auth__Mock__SigningKey`, `App__DefaultCourseId`)

## 7. API — Dev Endpoint Update

- [ ] 7.1 Update `POST /dev/login` endpoint: accept `{ golferId }`, call `MockAuthProvider.IssueTokenAsync(golferId)`, return `{ "token": "<jwt-string>" }` with HTTP 200; remove the cookie-setting behaviour from the previous implementation
- [ ] 7.2 Confirm `GET /dev/golfers` is unchanged; update its registered-only-when-mock guard to use the new `Auth:Provider` config key if the previous implementation used the old `AUTH_PROVIDER` env var directly

## 8. Next.js — Auth0 Integration

- [ ] 8.1 Add `@auth0/nextjs-auth0` to `web/package.json` and install
- [ ] 8.2 Create `web/app/api/auth/[auth0]/route.ts` — Auth0 callback handler using the `handleAuth()` export from `@auth0/nextjs-auth0`
- [ ] 8.3 Create `web/lib/auth.ts` exporting a `getAccessToken()` server-side helper that reads the active session and returns the access token string (throws if no session); used by server components and route handlers to get the Bearer token for API calls
- [ ] 8.4 Update `web/lib/api.ts`: add `apiFetchAuthenticated(path, token, options?)` that calls `apiFetch` with `Authorization: Bearer ${token}` added to the request headers
- [ ] 8.5 Update `web/.env.local.example` with all Auth0 variables: `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`, and `NEXT_PUBLIC_AUTH_PROVIDER=mock` as the default

## 9. Next.js — Login Page

- [ ] 9.1 Create `web/app/login/page.tsx` — server component; if `NEXT_PUBLIC_AUTH_PROVIDER=mock`, redirect to `/dev/login`; if `auth0`, render a "Log in with Auth0" link pointing to `/api/auth/login` (the `@auth0/nextjs-auth0` login route)

## 10. Next.js — Mock Session Flow

- [ ] 10.1 Create `web/app/api/dev/login/route.ts` — POST route handler that accepts `{ golferId }`, calls `POST /dev/login` on the ASP.NET Core API, receives `{ token }`, wraps the token in an encrypted session cookie (using `jose` or `@auth0/nextjs-auth0` session utilities) matching the session shape that `getAccessToken()` in `web/lib/auth.ts` reads; returns a redirect to `/me`
- [ ] 10.2 Update `web/app/dev/login/GolferSelector.tsx` to POST to `/api/dev/login` (the Next.js route handler from 10.1) instead of directly to the API

## 11. Next.js — Protected Pages and Middleware

- [ ] 11.1 Update `web/app/me/page.tsx` to call `getAccessToken()` server-side and pass the Bearer token to `apiFetchAuthenticated`; handle 401 with a redirect to `/login` and 403 `{ "error": "not_registered" }` with an "Account not registered at this course — contact your commissioner" message rendered inline (use the `email` field from the response body in the message)
- [ ] 11.2 Create `web/middleware.ts` — Next.js middleware that redirects unauthenticated requests on protected paths (initially just `/me`) to `/login`; "authenticated" means a valid session cookie exists

## 12. Next.js — Logout

- [ ] 12.1 Create `web/app/api/auth/logout/route.ts` — calls the `@auth0/nextjs-auth0` `handleLogout()` to clear the session cookie; redirects to `/` on completion
- [ ] 12.2 Add a "Log out" link or button to `web/app/me/page.tsx` that calls `/api/auth/logout`

## 13. Verification

- [ ] 13.1 `docker compose up -d --build` — confirm all three services start; confirm API startup validation passes with the mock configuration from `.env.example`
- [ ] 13.2 With `NEXT_PUBLIC_AUTH_PROVIDER=mock` and `Auth__Provider=Mock`: navigate to `/dev/login`, select a golfer that already has an `ExternalAuthId` set, confirm redirect to `/me` and profile displays correctly
- [ ] 13.3 Reset one golfer's `ExternalAuthId` to null in the database; log in as that golfer via `/dev/login`; confirm the first-time-login linking flow writes `ExternalAuthId` to the database and `/me` returns 200
- [ ] 13.4 Call `GET /me` directly on the API with no `Authorization` header; confirm 401 `{ "error": "missing_token" }`
- [ ] 13.5 Call `GET /me` with a tampered or expired Bearer token; confirm 401 `{ "error": "invalid_token" }`; confirm the specific failure reason appears in server logs and NOT in the response body
- [ ] 13.6 Call `GET /me` with a valid mock JWT whose `email` does not match any pre-registered golfer at the default course; confirm 403 `{ "error": "not_registered", "email": "<the-email-in-the-token>" }`
- [ ] 13.7 Restart the API with `Auth__Provider=Mock` and `ASPNETCORE_ENVIRONMENT=Production`; confirm the application refuses to start with a clear error message
- [ ] 13.8 Restart the API with `Auth__Provider=Auth0` and missing `Auth__Auth0__Domain`; confirm the application refuses to start with a clear error message
- [ ] 13.9 Confirm `/dev/login`, `/api/dev/login`, and `GET /dev/golfers` are unavailable (404) when `Auth__Provider=Auth0` and `NEXT_PUBLIC_AUTH_PROVIDER=auth0`
- [ ] 13.10 (Auth0 environment required) With a real Auth0 tenant configured: complete the Auth0 login flow end-to-end; confirm JWT is validated against JWKS, first-time-login linking writes `ExternalAuthId`, and `/me` returns 200 on the subsequent login

## 14. Documentation

- [ ] 14.1 Add the following bullet to the "Key Constraints" section of `openspec/project.md`: "- MVP assumes single-course deployment per API instance; `App:DefaultCourseId` identifies the course. Multi-course routing is deferred — see the auth0-integration proposal."
