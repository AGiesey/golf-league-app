## Context

The previous change (`2026-04-25-course-league-and-golfer-auth`) wired the `IAuthProvider` abstraction and left `Auth0AuthProvider` as a stub that throws `NotImplementedException`. `MockAuthProvider` works but uses a plain `mock-golfer-id` cookie — there is no JWT, no Bearer token, and no `Authorization` header involved. The development and production auth paths share an interface name but exercise completely different code.

This change makes the mock a faithful stand-in for production auth. Real Auth0 login replaces the stub. After this change, the entire token-validation path runs identically in both environments; the only difference is which signing key is used to verify the JWT.

## Goals / Non-Goals

**Goals:**
- Replace `Auth0AuthProvider` stub with a working JWT-validating implementation using Auth0's JWKS endpoint
- Upgrade `MockAuthProvider` to issue and validate HMAC-signed JWTs; retire the cookie-based approach
- Update `IAuthProvider` interface: new method signature `ValidateTokenAsync(string bearerToken)`, `AuthResult` gains `Email` field
- Update golfer-resolution middleware to extract Bearer tokens from the `Authorization` header
- First-time-login linking: match `email` claim against a pre-registered `Golfer` with null `ExternalAuthId` at the configured default course; write `ExternalAuthId` on match
- Defined response contracts for all four auth states (missing token, invalid token, valid token without Golfer link, valid token with Golfer link)
- Next.js login flow via `@auth0/nextjs-auth0`: Auth0 redirect → callback → encrypted httpOnly session cookie
- Bearer token forwarded server-side from the session cookie on every API request
- Updated mock `/dev/login` flow: clicking a golfer issues a mock JWT from the API and stores it in the same session cookie structure as real Auth0 logins
- Client-side logout: clear the session cookie, no server-side state to invalidate
- Production guard: startup check throws if `MockAuthProvider` is configured when `ASPNETCORE_ENVIRONMENT=Production`
- No Auth0 account or environment variable required for local development in mock mode

**Non-Goals:**
- Token refresh / silent renew
- Session expiry handling beyond "expired token → redirect to login"
- Role-based authorization checks (commissioner-only endpoints) — deferred to the features that require them
- Password reset and email verification — Auth0 handles these out-of-band
- Course admin role — intentionally deferred per data model
- Any UI for the commissioner to manage golfer registrations — SQL-only at MVP
- Multi-course login routing — MVP uses a single configured default course; multi-course is post-MVP
- Auth0 Actions / custom claim pipeline configuration — required Auth0 setup is documented as a manual step, not automated by this change

## Decisions

### D1: Unified Bearer-token contract across environments

All authenticated requests to the ASP.NET Core API carry `Authorization: Bearer <token>`. This is the contract in production (Auth0 JWTs) and in development (mock JWTs). The previous `mock-golfer-id` cookie approach is retired entirely.

**Why:** the cookie-based mock meant the API's JWT validation path was never exercised during development. A bug in `Auth0AuthProvider` (wrong claim name, JWKS caching issue, wrong audience) would only surface in production. Unifying on Bearer tokens means the same middleware, the same claim extraction, and the same error paths run in every environment.

### D2: `IAuthProvider` interface revision

Current interface (from previous change):

```
ResolveAsync(HttpContext context) → Task<AuthResult?>
```

Updated interface:

```
ValidateTokenAsync(string bearerToken) → Task<AuthResult?>
```

`AuthResult` record gains an `Email` property:

```
record AuthResult(string ExternalAuthId, string Email)
```

The middleware extracts the Bearer token from the `Authorization` header and passes the raw token string to the provider. This decouples the provider from `HttpContext`, makes unit testing straightforward, and keeps the interface contract focused on validation rather than HTTP plumbing.

Token issuance (mock only) is **not** on the interface — it belongs on `MockAuthProvider` directly and is accessed by the dev endpoint via a concrete reference, not through the interface.

### D3: JWT claims — `sub` for identity, `email` for first-time linking

| Claim | Field in `AuthResult` | Usage |
|-------|-----------------------|-------|
| `sub` | `ExternalAuthId` | Stable identity anchor on every request |
| `email` | `Email` | Used only during first-time linking; ignored once the link exists |

**Why `sub` and not `email` as the primary identity:** email is mutable (users can change it in their Auth0 profile), fallible (typos), and non-unique across OAuth providers. `sub` is assigned by Auth0, stable for the lifetime of the Auth0 account, and unique within the tenant. It is the correct anchor per OIDC conventions.

**Why `email` for first-time linking:** the commissioner pre-registers golfers with an email address before Auth0 accounts exist. The `email` claim is the only available bridge between a new Auth0 identity and the pre-existing `Golfer` row at first login. After the link is made, `email` is no longer involved in auth resolution.

**Auth0 `email` claim in the access token — resolved.** Auth0 does not include `email` in access tokens by default — it lives in the ID token. Adding the `email` scope to the authorization request makes email available in the ID token but does not affect the access token. There is no simpler path: access token claims must be added explicitly via an Auth0 Action.

**Critical namespacing constraint:** Auth0 requires custom access token claim names to be namespaced URI strings to avoid silent collision with registered OIDC claim names. Using a bare name like `email` as the claim key will cause the claim to be silently dropped — the token is issued without the claim and no error is raised. A fully-qualified URI avoids this.

**Chosen approach: Auth0 Post Login Action with a namespaced claim.** A custom Action deployed to the Auth0 tenant's Login flow runs after every successful authentication and adds the user's email as a custom claim to the access token:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  api.accessToken.setCustomClaim('https://golf-league-app/email', event.user.email);
};
```

Exact claim name read by `Auth0AuthProvider`: **`https://golf-league-app/email`**

The namespace URI (`https://golf-league-app/`) does not need to be a resolvable URL — it is an identifier only. Auth0 requires it to be an HTTP/HTTPS URI that does not belong to Auth0's own domains.

`MockAuthProvider` uses the bare `email` claim in its JWTs (the mock controls the entire token structure and has no collision risk). Each provider extracts email from its own claim name and maps it to `AuthResult.Email`. Code above the provider layer sees only `AuthResult.Email`; the namespaced claim name is an implementation detail isolated to `Auth0AuthProvider`.

**Required Auth0 tenant setup steps (one-time, manual) — also documented in `docs/auth0-setup.md`:**
1. In the Auth0 dashboard, navigate to **Actions → Library**, click **"Build Custom"**, name it "Add email to access token", and select trigger **"Login / Post Login"**.
2. Paste the Action code above and click **"Deploy"**.
3. Navigate to **Actions → Flows → Login**, drag the deployed action between "Start" and "Complete", and click **"Apply"**.

**Mock provider:** the mock JWT sets `sub` to `mock|{golfer-uuid}` and `email` to the golfer's registered email. Same claim names, same structure as the Auth0 JWT.

### D4: Token storage — httpOnly session cookie on the Next.js side

`@auth0/nextjs-auth0` manages the Auth0 session in an encrypted httpOnly cookie. The raw access token never enters the browser's JavaScript environment.

For API calls from the Next.js layer:
- **Server components and route handlers** call `getSession()` server-side, extract the access token, and attach it as `Authorization: Bearer <token>` on outgoing requests to the ASP.NET Core API.
- **Client components** that need data call Next.js route handlers or server actions, which forward the Bearer token. Client components never send tokens directly to the ASP.NET Core API.

**Why not localStorage:** localStorage is readable by any JavaScript running on the page. An XSS vulnerability anywhere in the application exposes the token immediately. httpOnly cookies are immune to this class of attack.

**Why not in-memory React state:** tokens stored in React state do not survive page refreshes. Every full navigation would re-require a session bootstrap round-trip, degrading the experience and burning Auth0 rate limits.

**CSRF tradeoff:** httpOnly cookies require CSRF protection for any Next.js route handler that mutates data. `@auth0/nextjs-auth0` handles CSRF on its own routes. Any custom POST/PUT/DELETE route handler in this app must also verify the CSRF token provided by the library.

**All API calls are server-side — the browser never calls the ASP.NET Core API directly.** The call pattern for every authenticated data fetch is:

```
browser request
  → Next.js server component / route handler / server action
      reads session server-side, extracts access token
      → ASP.NET Core API  (Authorization: Bearer <token>)
      ← response
  ← Next.js renders or returns data to browser
```

The access token travels only between Next.js server code and the ASP.NET Core API. The browser never holds or transmits a token. This is a deliberate security boundary: an XSS vulnerability in the frontend cannot steal the access token because the token never reaches the browser's JavaScript environment.

**Tradeoff — double-hop latency.** Every data fetch adds a Next.js → ASP.NET Core hop. For MVP with both services colocated in Docker Compose on the same host, the added latency is negligible. If the API is ever deployed separately (public API, different host), the hop becomes a real latency consideration — that is a future-deployment concern, not an MVP concern.

**Streaming and direct browser-to-API calls — deferred.** All data fetching in MVP goes through Next.js server code. If a future feature requires streaming data directly from the ASP.NET Core API to the browser (e.g., real-time score updates via Server-Sent Events), a short-lived, audience-scoped token issued per-request would be needed. No exception to the server-side-only rule is made in this proposal; direct browser-to-API calls are explicitly deferred.

**Mock session parity:** the mock `/dev/login` flow issues a mock JWT from the API and stores it in an encrypted Next.js session cookie using the same `@auth0/nextjs-auth0` session shape (or a minimal equivalent using `jose`). Server components then retrieve it identically — no conditional code path based on provider.

### D5: First-time-login linking flow

The golfer-resolution middleware executes this logic on every request with an `Authorization` header:

```
1. Extract Bearer token from Authorization header
   → No header or malformed header: 401 { "error": "missing_token" }

2. Call IAuthProvider.ValidateTokenAsync(token)
   → Returns null (invalid signature, wrong issuer, expired): 401 { "error": "invalid_token" }
   → Specific failure reason (expired, bad signature, wrong iss/aud) is logged server-side at Warning level; it is NOT included in the response body.

3. Extract ExternalAuthId (sub) and Email from AuthResult

4. Lookup: SELECT * FROM golfers
         WHERE course_id = {DefaultCourseId}
           AND external_auth_id = {ExternalAuthId}
           AND archived_at IS NULL
   → Found: attach Golfer to HttpContext.Items["Golfer"], proceed

5. First-time-login path:
   Lookup: SELECT * FROM golfers
           WHERE course_id = {DefaultCourseId}
             AND email = {Email}
             AND external_auth_id IS NULL
             AND archived_at IS NULL
   → Found exactly one: UPDATE SET external_auth_id = {ExternalAuthId};
                        attach Golfer to HttpContext.Items["Golfer"], proceed
   → Found zero: 403 { "error": "not_registered", "email": "<email from AuthResult>" }
   → Found more than one: 500 (data integrity error — violates the (CourseId, Email)
                               unique constraint; cannot happen in a consistent database)
```

Steps 4 and 5 are wrapped in a database transaction to prevent a race between two concurrent first-logins for the same golfer.

### D6: Multiple Golfer records sharing an email across courses

The `(CourseId, Email)` unique constraint on `Golfer` guarantees **at most one** unlinked Golfer per email per course. The same email may legitimately appear at multiple courses (one person who plays at two clubs), but the first-time-login lookup is scoped to `DefaultCourseId`, so there is no ambiguity: within a single course, the match is unambiguous or returns zero results.

### D7: How the API knows the correct CourseId (MVP approach)

During first-time linking, the middleware needs a `CourseId` to scope the Golfer lookup. Options considered:

| Option | Description | Post-MVP path |
|--------|-------------|---------------|
| `DEFAULT_COURSE_ID` config | API reads a configured UUID at startup | Replace with URL-scoped routes or login-state param |
| URL-scoped routes | All endpoints under `/courses/{courseId}/...` | Clean long-term model |
| Auth0 custom claim | Auth0 Action injects `course_id` into every token | Works but couples Auth0 config to courses |
| Login-time state param | `courseId` passed in OAuth `state`, returned in callback | Good for multi-course UX |

**Recommended for MVP:** `DEFAULT_COURSE_ID` as a required configuration value. Multi-course is explicitly post-MVP per `project.md`. This approach is honest about the assumption, makes the config visible, and does not block the post-MVP multi-course path — the `DefaultCourseId` call site in the middleware is the only place that needs to change.

The `App:DefaultCourseId` value is required at startup; missing or malformed value is a startup error with a clear message.

### D8: Response contracts for the four auth states

**State 1 — Missing or malformed token**
- Trigger: no `Authorization` header present, or the header value is not in `Bearer <token>` form (missing prefix, empty value after prefix)
- HTTP status: **401 Unauthorized**
- Body: `{ "error": "missing_token" }`
- Server log: none

**State 2 — Invalid token**
- Trigger: token is present but validation fails — bad signature, expired `exp`, wrong `iss`, wrong `aud`, or malformed JWT structure
- HTTP status: **401 Unauthorized**
- Body: `{ "error": "invalid_token" }`
- Server log: the specific failure reason is written at **Warning** level (e.g., "JWT validation failed: SecurityTokenExpiredException — exp 2026-04-26T12:00:00Z"). The specific reason is **not** returned to the client; leaking it would inform an attacker about the validation logic.

**State 3 — Valid token, no linked Golfer**
- Trigger: token validates, but no `Golfer` matches the `ExternalAuthId`, and the first-time-login email match also finds no pre-registered Golfer at the default course with that email and a null `ExternalAuthId`
- HTTP status: **403 Forbidden**
- Body: `{ "error": "not_registered", "email": "<email from token>" }`
- Server log: informational (unmatched email and course ID)
- Frontend use: the `email` field enables a message like "<email> is not registered at this course — contact your commissioner." The user already knows their own email; including it is not a privacy concern.

**State 4 — Valid token, Golfer resolved**
- Trigger: token validates, Golfer found (by `ExternalAuthId` on a repeat login, or linked via first-time email match)
- HTTP status: determined by the downstream endpoint handler
- Body: normal endpoint response
- Middleware action: the resolved `Golfer` is attached to `HttpContext.Items["Golfer"]` for downstream handlers

The 403 in state 3 is semantically distinct from 401: the user is authenticated (identity confirmed by token signature) but not authorized (no Golfer registration exists for them at this course). Using 403 enables the frontend to show a "contact your commissioner" message rather than a generic login redirect.

### D9: Upgraded `MockAuthProvider` — JWT structure

The mock provider mints JWTs signed with HMAC-SHA256 using a symmetric key from configuration (`Auth:Mock:SigningKey`):

| Claim | Value |
|-------|-------|
| `sub` | `mock\|{golfer-uuid}` |
| `email` | Golfer's registered email address |
| `iss` | `golf-league-mock` |
| `aud` | `golf-league-api` |
| `exp` | 24 hours from issuance |
| `iat` | Current UTC timestamp |

`ValidateTokenAsync` verifies signature, `iss`, `aud`, and `exp` locally. No JWKS call; no external dependency.

Token issuance happens via a `IssueTokenAsync(Guid golferId)` method on `MockAuthProvider` (not on `IAuthProvider`). The dev-only `POST /dev/login` endpoint receives `MockAuthProvider` directly from DI (it is registered as a concrete type in mock mode) and calls this method.

### D10: Production guard

At API startup, before any middleware or routes are registered:

```
if ASPNETCORE_ENVIRONMENT == "Production" AND Auth:Provider == "Mock"
  → throw InvalidOperationException("MockAuthProvider cannot be used in Production. Set Auth:Provider=Auth0.")

if Auth:Provider == "Auth0"
  AND (Auth:Auth0:Domain is missing OR Auth:Auth0:Audience is missing)
  → throw InvalidOperationException("Auth:Auth0:Domain and Auth:Auth0:Audience are required when Auth:Provider=Auth0.")

if App:DefaultCourseId is missing OR is not a valid UUID
  → throw InvalidOperationException("App:DefaultCourseId is required and must be a valid UUID.")
```

These checks run before `app.Run()` and produce startup failure with a human-readable message rather than a NullReferenceException at request time.

### D11: Configuration shape

**API — `appsettings.json` / environment variables:**

```json
{
  "Auth": {
    "Provider": "Mock",
    "Auth0": {
      "Domain": "",
      "Audience": ""
    },
    "Mock": {
      "SigningKey": ""
    }
  },
  "App": {
    "DefaultCourseId": ""
  }
}
```

Docker Compose env var equivalents (double-underscore notation):
`Auth__Provider`, `Auth__Auth0__Domain`, `Auth__Auth0__Audience`, `Auth__Mock__SigningKey`, `App__DefaultCourseId`.

Default value for `Auth__Provider` when unset: `Mock` (preserves current behaviour; production deployments must set it explicitly to `Auth0`).

**Next.js — `.env.local` additions:**

```
# Auth0 (required when NEXT_PUBLIC_AUTH_PROVIDER=auth0)
AUTH0_SECRET=<random-32-byte-secret>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<auth0-client-id>
AUTH0_CLIENT_SECRET=<auth0-client-secret>
AUTH0_AUDIENCE=<api-audience>         # must match Auth__Auth0__Audience on the API

# Provider selector (controls which login flow the frontend uses)
NEXT_PUBLIC_AUTH_PROVIDER=mock        # "mock" | "auth0"
```

When `NEXT_PUBLIC_AUTH_PROVIDER=mock`, all Auth0 variables are unused and may be omitted. This is the default for local development — no Auth0 account needed.

### D12: Logout

Logout is purely client-side. The `@auth0/nextjs-auth0` logout route (`/api/auth/logout`) clears the encrypted session cookie. No call to the ASP.NET Core API is needed because there is no server-side session to invalidate — the API is stateless.

After logout, the user is redirected to `/` (or `/login`). Expired JWTs in old session cookies are rejected at the API by `ValidateTokenAsync` — no server-side revocation list is needed at MVP.

## Current Assumptions

**Single-course deployment per API instance.** The `App:DefaultCourseId` configuration value identifies the one course whose `Golfer` records are eligible for first-time-login linking. This means one API deployment serves one course. Deploying for a second course requires a separate instance with a different `App:DefaultCourseId`.

The data model is already multi-course-correct (`Golfer.CourseId`, per-course uniqueness constraints). The single-course constraint is at the deployment and routing layer, not the data layer — no schema change is needed when multi-course support is added.

Multi-course support, where a single API instance serves multiple courses and determines the correct course from a runtime signal, is deferred. The shape of that routing (URL-scoped routes, subdomain, or login-time state parameter) is the open question noted below. This assumption is called out in `openspec/project.md` under Key Constraints (task 14.1).

## Risks / Trade-offs

- **Auth0 Action must be deployed before first-time-login works** — the `https://golf-league-app/email` custom claim exists only if the Post Login Action is deployed and wired into the Login flow. If it is not configured, `Auth0AuthProvider` returns an `AuthResult` with an empty `Email`, and every first-login attempt returns 403 `not_registered` even for correctly pre-registered golfers. Setup steps are in `docs/auth0-setup.md`. Symptom of missing setup: new users always get 403 despite having a pre-registration.
- **`DEFAULT_COURSE_ID` encodes a single-course assumption** — see Current Assumptions section above. The risk is that future proposals treat this as a trivial config value rather than an architectural decision point requiring deliberate replacement.
- **httpOnly cookie + server-side forwarding adds indirection** — client components cannot call the ASP.NET Core API directly. All data fetching must go through Next.js route handlers or server actions. This is sound and aligns with App Router patterns, but it means more route handler boilerplate per API call.
- **Mock signing key is a shared secret in development** — the key from `.env.example` is the same for every developer. Tokens minted by one developer are valid against another's running API instance (both use the same key). Low risk in a dev environment, but worth noting.
- **24-hour mock token lifetime** — long enough that development sessions never expire mid-work, but also means a leaked mock token is valid for a day. Acceptable given the mock is dev-only and guarded against production use.
- **JWKS caching** — `Auth0AuthProvider` must cache the JWKS (1-hour TTL recommended) to avoid a JWKS fetch on every API request. A missing or poorly-implemented cache would add ~100ms+ of latency to every authenticated endpoint under load.

## Open Questions

1. **Multi-course post-MVP routing:** When multi-course support is added, should course context come from (a) URL-scoped routes (`/courses/{courseId}/...`), (b) login-time OAuth `state` parameter, or (c) a custom Auth0 claim? Option (a) is the cleanest long-term model and aligns with RESTful conventions. This decision affects routing conventions across the whole app and should be a deliberate choice in the multi-course proposal — not retrofitted silently.

2. **CSRF protection scope for custom route handlers:** `@auth0/nextjs-auth0` provides CSRF tokens for its own routes. Should every custom Next.js POST/PUT/DELETE route handler also verify a CSRF token, or only those that mutate persistent state? Recommend: yes, all mutating route handlers — but the exact implementation (SameSite cookies, custom CSRF header, or library-provided token) should be confirmed before implementing protected mutations.

3. **Mock signing key per-developer vs. shared:** should each developer generate their own `Auth__Mock__SigningKey` (preventing cross-developer token reuse) or use a shared key from `.env.example` (simpler onboarding)? Shared key is recommended for MVP; individual keys can be revisited if there is a real concern about developer-issued tokens crossing instances.
