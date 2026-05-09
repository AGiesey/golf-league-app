# Authorization

> Canonical reference for what authenticated users are allowed to do.
> Source of truth for how authorization is checked and where rules live.
> Any proposal that adds, removes, or changes authorization rules must
> update this document as part of its tasks.

## What this document covers

- The authorization pattern (centralized, context-driven)
- The active rules and what enforces them
- How to add new rules without sprinkling checks through the codebase

It does **not** cover identity verification or how the league context is
resolved. See `auth-and-league-context.md` for that.

## Principles

**Authorization is centralized. Domain code does not check roles.**

There is one place — an authorization policy/handler — that answers
"can this user perform action X in league Y?" Endpoint and component
code calls that policy; it does not inline `if (membership.IsCommissioner)`
checks. This is the single most important rule in this doc.

**Authorization reads from the league context, never from the client.**

The active `LeagueContext` (see `auth-and-league-context.md`) is derived
server-side on every request from authoritative database state. The
client cannot claim a role it doesn't have.

**Roles are league-scoped.**

There is no global "commissioner." A user is the commissioner *of a
specific league/season*. Authorization checks are always asked in the
context of "this user, this league, this action" — not "this user, this
action."

**Rules deny by default.**

A request to a protected route or API without an authoritative answer
of "yes, allowed" is denied. There is no implicit allow.

## Roles in the system

| Role | Source | Scope | Notes |
|---|---|---|---|
| Super admin | None (SQL only) | Global | Not modeled in DB. Operates via direct SQL at MVP. |
| Course admin | Deferred | Course | Will be added when course admin UI is built. |
| Commissioner | `LeagueMembership.IsCommissioner` | League/season | A commissioner is also a regular member. |
| Golfer | Implicit | Per membership | Any active `LeagueMembership` makes someone a golfer in that league. |

The course admin role is **intentionally deferred** until a course admin
UI is built. When added, the authorization policy gains a new check
(`canManageSchedule`, `canCreateSeason`, etc.) without restructuring the
existing rules.

## The authorization pattern

### One policy, called from everywhere

A single authorization policy (an `IAuthorizationService` or equivalent
handler in ASP.NET Core's authorization framework) answers questions
of the form:

> *"Given this `LeagueContext`, is the user allowed to do `Action`?"*

Endpoints declare the action they require. Components hide UI elements
based on the same checks. There is no other location where role state
is consulted.

### Calling the policy

Server-side (API endpoints):

- Endpoints in `/commissioner/*` routes require a "user is commissioner
  of the active league" check. This is enforced via authorization policy
  attached to the endpoint or route group, not via inline checks in
  handlers.
- API endpoints that mutate league state (score entry, pairing changes,
  matchup creation) require the same check.
- Read endpoints scoped to the active league don't require a role
  check beyond "the user has a context for this league" — being a
  member is sufficient for reading.

Client-side (Next.js):

- The app shell hides the `/commissioner` nav link when
  `context.isCommissioner` is false. This is **UI only**, not enforcement.
- Route guards on `/commissioner/*` pages check the same flag and redirect
  if false. This is also UI — actual enforcement happens at the API.
- The pattern: hide what the user can't do, but never *rely* on hiding
  for security. The API is the boundary.

### Why client-side checks are not enforcement

A client-side check protects against accidental access (the user types
a URL, or a stale link points to a page they no longer have access to).
It does not protect against intentional access — anyone can call the
API directly. **The API is the only enforcement boundary.** Client
checks exist to make the UI clean, not to make the system secure.

## Active rules

### Reading league data

Any user with a valid `LeagueContext` for a league can read that
league's public data:

- Schedule
- Standings
- Matchups, pairings, results for completed weeks
- Their own scores and stats

Reading scores or stats *for other golfers in the same league* is
allowed (this is a league — everyone sees everyone's scores).

### Commissioner actions

A user whose active `LeagueContext` has `isCommissioner = true` can:

- Manage roster (add/remove `LeagueMembership` records)
- Form and edit teams
- Manage matchups (`ManageMatchups`): create, edit, and delete `Matchup`, `Pairing`, and `PairingSlot` records
- Enter and edit `Round` and `HoleScore` records
- Manage subs
- Override `MatchResult` records
- Configure `LeagueConfiguration` for the season's league
- Create, edit, and delete `Week` records (within the constraints of the
  course admin authority boundary — see below)

A commissioner's authority is scoped to **their league and their season**.
Commissioner of the 2026 Tuesday League can do none of the above for the
2026 Saturday League, even at the same course.

### Authority boundary: course admin vs. commissioner

When the course admin role is implemented, the boundary will be:

- **Course admin** owns the schedule structure: which weeks exist, dates,
  tee times, makeup days.
- **Commissioner** owns gameplay within a week: matchups, pairings,
  scores, results, side contests.

At MVP, course admin actions are performed via SQL by the super admin.
Commissioners cannot create or destroy weeks at MVP — the course admin
seeds the season's weeks via SQL, and commissioners operate within them.

This boundary will be enforced when the course admin role is added. It
is documented now to prevent commissioners from gaining capabilities at
MVP that they would later have to give up.

### Super admin actions

All super admin actions are performed via direct SQL at MVP:

- Create courses
- Create leagues
- Configure `LeagueConfiguration` for new leagues
- Bootstrap the first commissioner of a new league (insert a
  `LeagueMembership` with `IsCommissioner = true`)

Super admin is not modeled in the database and has no UI. Operations
that require it are documented in operations/runbook docs (not here).

## Bootstrapping the first commissioner

A brand-new league has no commissioner. Someone has to be the first.
The flow:

1. Super admin (via SQL) creates the `Course` (if new), the `League`,
   the initial `Season`, and the first `LeagueMembership` with
   `IsCommissioner = true` for the chosen golfer.
2. The chosen golfer logs in. The standard auth flow resolves their
   `Golfer` and finds the bootstrapped `LeagueMembership`. The league
   context now has `isCommissioner = true`.
3. The commissioner completes the rest of season setup through the UI:
   adding other members, forming teams, generating weeks, etc.

After this, the commissioner can promote co-commissioners through the
season setup UI by flipping the flag on other `LeagueMembership` records
in the season. New commissioners for *future seasons* can be bootstrapped
either by the previous commissioner or via SQL.

## How to add a new authorization rule

When a new feature requires a permission check:

1. **Define the action** as a named capability (e.g., `EnterScores`,
   `ManageRoster`, `ConfigureSideContest`).
2. **Add it to the authorization policy** in one place. The policy
   determines, for a given `LeagueContext` and named action, whether
   the action is allowed.
3. **Apply the policy at the API endpoint.** Use the framework's
   authorization mechanism (policy-based authorization in ASP.NET Core),
   not an inline check.
4. **Mirror the check in the UI** to hide controls that aren't
   available. Read from the same source of truth (the league context),
   not from a separate copy of the rules.
5. **Update this doc** with the new rule, where it's enforced, and
   what role(s) it requires.

The goal is that the answer to "what can a commissioner do?" is found
in this doc and in the authorization policy — nowhere else.

## What not to do

- **Don't put `if (membership.IsCommissioner)` checks in endpoint
  handlers.** Use the authorization policy.
- **Don't trust client-supplied role information.** The client may
  send a hint (which membership is active), but the server validates
  against the database every time.
- **Don't add a new role table or role flag without updating this doc
  and the policy.** Role proliferation without central documentation
  is the start of authorization drift.
- **Don't conflate "is a member" with "has access."** Being a member
  of a league grants read access to that league's data, nothing more.
  Write access requires a role check.
- **Don't enforce authorization in the database via row-level security
  or similar.** The application layer is the enforcement point. Database
  constraints exist for data integrity, not authorization.

## Open questions and deferred decisions

- **Course admin role implementation.** Will likely be a flag on
  `Golfer` or a join entity to `Course`. Decision deferred to when the
  course admin UI is designed.
- **Audit logging of authorization decisions.** Not implemented at MVP.
  If authorization audit becomes important (compliance, debugging
  permission issues), a structured audit log of "who did what when, and
  was it allowed" can be added without restructuring the policy.
- **Permission delegation.** A commissioner cannot currently grant
  another member a subset of their powers (e.g., "you can enter scores
  but not manage the roster"). If this becomes useful, it would be
  modeled as additional flags on `LeagueMembership` rather than a
  separate roles system.