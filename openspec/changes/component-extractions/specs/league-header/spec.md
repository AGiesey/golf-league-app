## ADDED Requirements

### Requirement: LeagueHeader component
A `LeagueHeader` component SHALL be created at `web/components/dashboard/LeagueHeader.tsx`. It SHALL accept `leagueName: string`, `seasonYear: number`, and `isCommissioner: boolean` props and render a `Card` containing the league name, season year as a description, and — when `isCommissioner` is true — a Commissioner `Badge`.

#### Scenario: Renders league name and season year
- **WHEN** `LeagueHeader` is rendered with `leagueName="Tuesday League"` and `seasonYear={2026}`
- **THEN** the card displays "Tuesday League" as its title and "Season 2026" as its description

#### Scenario: Commissioner badge shown for commissioners
- **WHEN** `isCommissioner` is true
- **THEN** a Badge labelled "Commissioner" is rendered alongside the league name

#### Scenario: No badge for regular golfers
- **WHEN** `isCommissioner` is false
- **THEN** no Commissioner badge is rendered

### Requirement: Dashboard uses LeagueHeader
`dashboard/page.tsx` SHALL use `LeagueHeader` in place of each of the four inline Card blocks that render league identity. No visual output SHALL change.

#### Scenario: All four dashboard render paths use LeagueHeader
- **WHEN** the dashboard renders in any of its four states (commissioner + setup incomplete, commissioner + setup complete, golfer + setup incomplete, golfer + setup complete)
- **THEN** the league header card is rendered by `LeagueHeader`, not inline JSX
