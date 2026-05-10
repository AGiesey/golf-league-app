# Season Setup

> Canonical reference for what "setting up a season" means, what counts
> as complete, and how the rest of the system reacts to incomplete
> setup. Source of truth for the season setup flow and its derived
> status. Any proposal that adds, removes, or changes setup requirements
> must update this document as part of its tasks.

## What this document covers

- What season setup is (and isn't)
- What requirements together mean "this season is ready to play"
- How that status is computed (not stored)
- How visibility and the dashboard react during setup
- Where setup ends and weekly commissioner work begins

It does **not** cover identity, authorization rules, or the data model
itself. See `auth-and-league-context.md`, `authorization.md`, and
`data-model.md` for those.

## Principles

**Setup is the once-per-year work, not the weekly work.**

A season is set up once at the start. After that, the commissioner does
*weekly* work — entering scores, adjusting pairings, running side
contests. Setup status reflects whether the *season* is ready to begin,
not whether any given week is ready to play.

**Setup completeness is derived, not stored.**

There is no `IsSetUp` boolean column anywhere. The status of a season's
setup is computed on read from the underlying data (the roster, the
teams, the schedule, etc.). This means:

- The status can never drift from reality. It *is* reality.
- Adding a new requirement is a code change in one place, not a
  migration plus a backfill plus every endpoint that touches setup
  remembering to recompute the flag.
- The same logic answers "is it complete?" and "what's missing?" — the
  UI gets both for free.

**A season exists from the moment it is created, even if it is not
ready to play.**

Golfers added to an in-progress setup are not hidden from the league.
They see it in their picker, they can land on the dashboard for it, and
they see a clear "this league isn't ready yet" empty state. The cost of
"I see a league but it's not ready" is much lower than the cost of "no
one told me I was added."

## What "set up" means

A season is **set up** (ready to play) when all of the following are
true:

| Requirement | Met when |
|---|---|
| **Roster** | At least 2 active `LeagueMembership` records exist for the season |
| **Teams** | Every active `LeagueMembership` belongs to a `Team` via `TeamMembership` |
| **Schedule** | At least one `Week` exists for the season; each week carries a `Nine` value (`Front`, `Back`, or `Full`) indicating which holes are played |

These are the minimum conditions for the league to function. Any of
them missing means matchups, pairings, score entry, or standings would
be impossible or meaningless.

### Why these specifically

- **At least 2 members, not 1.** Matchups require two teams, which
  require members. A one-person season is never going to play a round.
- **Every member on a team.** Unassigned members can't be put into
  matchups. The setup UI should surface "Bob isn't on a team" rather
  than letting it fail later.
- **At least one week.** A season with no weeks has nothing to play.
  Stricter rules (e.g., "all N weeks must be scheduled") are not
  enforced — the commissioner may want to schedule weeks iteratively or
  add makeup weeks later. One week is the minimum bar for a season that
  can begin.

### What is *not* a setup requirement

These are commissioner work, but they are **weekly** work, not season
setup:

- Matchups for any specific week
- Pairings within a matchup
- Tee times
- Side contests
- Score entry

A season can be fully "set up" with zero matchups created. The first
matchup gets created in the lead-up to week one, not during setup.

### Gameplay concerns are not setup concerns

Some things that *look* like setup are actually gameplay state that
evolves during the season. They are explicitly **not** setup
requirements:

- **Handicaps.** Many leagues do not have handicaps for every member at
  season start. A common pattern is "the first N weeks establish
  handicaps from gross scores, and net scoring begins in week N+1."
  Other leagues have brand-new members whose handicaps don't exist
  until they've played enough rounds. `LeagueMembership.handicap` is
  nullable to support this. A season is fully set up even if every
  member has a null handicap; the league just isn't doing net scoring
  yet.
- **Matchups, pairings, side contests.** Created weekly by the
  commissioner during the season, not during setup.
- **Scores and results.** Recorded as the season is played.

The line is: **setup is the administrative work of standing up the
season. Gameplay is what happens when the season is being played.**
Some gameplay state (handicaps especially) may take weeks to fully
materialize, and the system supports that without blocking setup
completion.

### Handicap establishment

Whether and how handicaps get established mid-season is a *handicap
system* concern, not a setup concern. The handicap system is a
configurable extension point on the league (see
`LeagueConfiguration.HandicapSystem`). Different systems handle
handicap establishment differently:

- **Commissioner-entered (MVP).** The commissioner types a number into
  `LeagueMembership.handicap` whenever they want — at setup, after a
  few weeks, or never if the league doesn't use handicaps.
- **Warm-up weeks (post-MVP).** A future handicap system may compute
  handicaps from the first N weeks of `HoleScore` records and update
  `LeagueMembership.handicap` automatically once enough data exists.
- **External (post-MVP).** GHIN or another external provider supplies
  the handicap.

None of these change the setup model. The data is the same. What
changes is the *implementation* that reads scores and writes
handicaps, and that lives behind the handicap system interface.

## The status object

Season setup status is computed by a service that returns:

```
SeasonSetupStatus {
  isComplete: bool
  requirements: [
    { name: "Roster",   isMet: bool, detail: "2 members added" },
    { name: "Teams",    isMet: bool, detail: "Bob is not on a team" },
    { name: "Schedule", isMet: bool, detail: "0 weeks scheduled" }
  ]
}
```

`isComplete` is `requirements.every(r => r.isMet)`.

The `detail` field is a short human-readable summary used by the UI to
explain what's missing. The exact format is a UI concern; the service
provides the structured data.

The status service is the single source of truth for both questions:

- "Is this season ready?" → `status.isComplete`
- "What's missing?" → `status.requirements.filter(r => !r.isMet)`

No other code path computes setup state. UI components, the dashboard
empty state, and any future automation (e.g., "send invitations when
setup completes") all read from this service.

## Visibility and dashboard behavior

A season in setup is **visible** to its members. Specifically:

- It appears in the league picker (see `auth-and-league-context.md`).
- A member can select it as their active league context.
- The dashboard renders for it.

The dashboard renders **differently** based on setup status:

- **Setup complete** → normal dashboard (schedule, standings, my stats,
  next week's match).
- **Setup incomplete, viewer is a regular golfer** → "this league
  isn't ready yet" empty state. Friendly message, no schedule or
  standings (there is nothing to show). May surface basic info
  ("Tuesday Night League — 2026 season — setup in progress").
- **Setup incomplete, viewer is the commissioner** → setup checklist
  is the dashboard. Each requirement is shown with its status and a
  link to the relevant section of `/commissioner/season` to complete it.

The commissioner experience during setup is essentially "a checklist
that becomes a dashboard once everything is done." A non-commissioner's
experience is "a placeholder that becomes a dashboard once the
commissioner finishes."

### What about the picker

The picker shows all of a golfer's memberships, regardless of setup
status. A member of an incomplete season sees it in the picker and can
select it. The dashboard handles the empty state — the picker doesn't
filter.

## The completion transition

When the commissioner saves the change that flips the last incomplete
requirement to met, the season is now fully set up. At MVP this
transition is implicit — the next dashboard render reflects the new
state. There is no explicit "mark season as ready" action.

Future proposals may attach behavior to this transition:

- **Invitations** — sending invitation emails to members when setup
  completes, rather than at member-add time, so the message reads
  "your league is ready" instead of "you've been added but can't do
  anything yet."
- **Notifications** — a `SeasonSetupComplete` event emitted through
  the notification abstraction, which other handlers can subscribe to
  (welcome email, audit log, etc.).

These are deferred to their respective proposals. The status service
makes them easy to add later — the transition is detectable from the
data without any extra state.

## What setup *is* in the UI

The commissioner reaches setup at `/commissioner/season` (or whatever
the eventual route is). The page is organized around the requirements
in the status object:

- Roster — add/remove members (handicaps may also be entered here, but
  are not gated by setup)
- Teams — form teams, assign members to teams
- Schedule — generate weeks for the season

A status banner at the top reflects `SeasonSetupStatus`: green when
complete, otherwise a checklist of what remains. Each item links to
the section that handles it.

This UI structure is intentional: the page *is* the checklist. The
status object drives what the page shows. New requirements added later
appear automatically as new sections without restructuring the page.

## What setup *is not*

Setup is not a wizard. The commissioner does not have to do roster,
then teams, then schedule, in order. They can jump between sections,
add a few members, generate the schedule, come back and add more
members. The status object reflects whatever's done at any moment.

Setup is not a one-shot. A season can drop *out* of "set up" if a
requirement becomes unmet — for example, if every member is removed
from a team mid-setup, the Teams requirement flips back to unmet. The
status reflects current data, not a high-water mark.

Setup does not block weekly work in any hard sense. The data model
permits creating a `Matchup` even when the season isn't fully set up.
The UI should generally prevent this (no point making matchups
without teams), but the underlying constraint is "matchup needs two
teams that have members," not "season must be marked set up."

## Cross-references

- `auth-and-league-context.md` — incomplete seasons appear in the
  picker; the dashboard renders different content based on setup
  status. The auth flow itself does not filter by setup status.
- `authorization.md` — commissioner is the only role that can complete
  setup. This follows from the existing commissioner authorization
  rules; no new rule is added.
- `data-model.md` — all setup requirements are computed from existing
  entities. No schema additions are needed to support setup status.

## Open questions and deferred decisions

- **Stricter schedule completeness.** "At least one week" is the MVP
  bar. A future proposal may require all expected weeks to exist
  before setup is considered complete (e.g., "20 weeks scheduled for
  a 20-week season"). This requires capturing intended season length,
  which is not currently modeled.
- **Setup completion notifications.** Deferred to the notification
  proposal. The hook is the `SeasonSetupComplete` event, which can
  be emitted when the status flips to complete on a save.
- **Invitations gated on setup completion.** Deferred to the
  invitation proposal. Holding invitation sends until setup is
  complete is a UX decision, not a data model one — the data already
  supports either timing.
- **Course admin's role in setup.** When the course admin role is
  implemented, schedule generation may move from commissioner to
  course admin. The Schedule requirement would still exist in setup
  status; the role allowed to fulfill it would shift. No structural
  change to this doc — just an update to the Teams/Schedule rows in
  the requirements table when the course admin role lands.
- **Editing `Week.Nine` via UI.** The `Nine` field (Front / Back / Full) is
  currently set only via seed SQL. A UI to view and edit which nine is
  played for each week is part of the deferred course admin work.