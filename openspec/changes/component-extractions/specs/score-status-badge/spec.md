## ADDED Requirements

### Requirement: ScoreStatusBadge component
A `ScoreStatusBadge` component SHALL be created at `web/components/scorecard/ScoreStatusBadge.tsx`. It SHALL accept `slotCount: number` and `roundCount: number` and render a single `Badge` whose label and variant reflect the entry status:
- `slotCount === 0` → "No matchups", `secondary` variant
- `roundCount === 0` → "Not started", `outline` variant
- `roundCount < slotCount` → "Partial", `default` variant with warning colour
- `roundCount === slotCount` → "Complete", `default` variant with success colour

#### Scenario: No matchups state
- **WHEN** `slotCount` is 0
- **THEN** the badge reads "No matchups" with the `secondary` variant

#### Scenario: Not started state
- **WHEN** `slotCount > 0` and `roundCount === 0`
- **THEN** the badge reads "Not started" with the `outline` variant

#### Scenario: Partial state
- **WHEN** `roundCount > 0` and `roundCount < slotCount`
- **THEN** the badge reads "Partial"

#### Scenario: Complete state
- **WHEN** `roundCount === slotCount` and `slotCount > 0`
- **THEN** the badge reads "Complete"

### Requirement: Shared nineLabel and formatDate utilities
`nineLabel(nine: string): string` and a `formatDate` utility SHALL be exported from `web/components/scorecard/ScoreStatusBadge.tsx` (or a collocated utilities file) so both scores pages can import them rather than duplicating the implementations.

#### Scenario: nineLabel maps nine strings to display labels
- **WHEN** `nineLabel` is called with `"Front"`, `"Back"`, or `"Full"`
- **THEN** it returns `"Front 9"`, `"Back 9"`, or `"18 holes"` respectively

### Requirement: Both scores pages use ScoreStatusBadge
`scores/page.tsx` and `scores/[weekId]/page.tsx` SHALL replace their inline `statusPill`/Badge/colour-override blocks and duplicated helper functions with `ScoreStatusBadge` and the shared utilities. No visual output SHALL change.

#### Scenario: Scores list page uses ScoreStatusBadge
- **WHEN** `scores/page.tsx` renders a week row
- **THEN** the status badge is rendered by `ScoreStatusBadge`, not inline JSX with a local `statusPill` function

#### Scenario: Week detail page uses ScoreStatusBadge
- **WHEN** `scores/[weekId]/page.tsx` renders a matchup row
- **THEN** the status badge is rendered by `ScoreStatusBadge`, not inline JSX
