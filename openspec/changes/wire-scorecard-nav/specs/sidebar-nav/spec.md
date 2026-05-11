## ADDED Requirements

### Requirement: Manage Scores commissioner nav item
The sidebar SHALL render a "Manage Scores" nav item in the Commissioner section linking to `/commissioner/scores`. The item SHALL only appear when `isCommissioner` is true.

#### Scenario: Commissioner sees Manage Scores link
- **WHEN** the resolved league context has `isCommissioner: true`
- **THEN** the sidebar contains a link to `/commissioner/scores` labelled "Manage Scores" within the Commissioner section

#### Scenario: Regular golfer does not see Manage Scores link
- **WHEN** the resolved league context has `isCommissioner: false`
- **THEN** the sidebar does not contain "Manage Scores"

#### Scenario: Manage Scores link is active when on score-entry pages
- **WHEN** the current pathname starts with `/commissioner/scores`
- **THEN** the "Manage Scores" nav item is rendered in its active visual state

## REMOVED Requirements

### Requirement: Scores/Rounds placeholder present
**Reason**: The placeholder "Scores / Rounds" disabled nav item is replaced by the live "Manage Scores" commissioner link and will be removed from the member nav section.
**Migration**: Remove the `{ label: "Scores / Rounds", disabled: true }` entry from `MEMBER_ITEMS` in `Sidebar.tsx`. Golfers reach score views via the dashboard widget links, not a sidebar item.
