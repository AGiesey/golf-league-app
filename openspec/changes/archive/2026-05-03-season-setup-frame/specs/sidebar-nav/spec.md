## ADDED Requirements

### Requirement: Season nav item for commissioners
The sidebar SHALL render a "Season" nav item linking to `/commissioner/season` when the resolved league context has `isCommissioner: true`. The item SHALL NOT be visible to regular golfers or when context is unavailable.

#### Scenario: Commissioner sees Season link
- **WHEN** the resolved league context has `isCommissioner: true`
- **THEN** the sidebar contains a link to `/commissioner/season` labelled "Season"

#### Scenario: Regular golfer does not see Season link
- **WHEN** the resolved league context has `isCommissioner: false`
- **THEN** the sidebar does not contain a "Season" nav item

#### Scenario: Season link is active when on commissioner pages
- **WHEN** the current path starts with `/commissioner/season`
- **THEN** the Season nav item is rendered in its active/selected visual state
