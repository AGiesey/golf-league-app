## ADDED Requirements

### Requirement: ScorecardPanel component
A `ScorecardPanel` component SHALL be created at `web/components/scorecard/ScorecardPanel.tsx`. It renders a `Card` containing a `Scorecard`, with an optional section label in `CardHeader`. It is the named-component equivalent of the current `renderScorecard` local function in `ScorecardView.tsx`.

Props:
- `holes: HoleInfo[]`
- `slots: Slot[]` — the pairing slots (used to build `SlotScore[]` via `buildSlotScores`)
- `scoreOffset: number` — offset into the full hole-scores array (0 for front nine, 9 for back nine)
- `label?: string` — optional section label (e.g. "Front 9", "Back 9")
- `entryButton?: (slot: SlotScore) => React.ReactNode` — render prop for per-slot action buttons; mirrors the existing `Scorecard` API

#### Scenario: Renders without label
- **WHEN** `label` is not provided
- **THEN** no `CardHeader` is rendered; only `CardContent` with the `Scorecard`

#### Scenario: Renders with label
- **WHEN** `label` is `"Front 9"`
- **THEN** a `CardHeader` with `CardTitle` "Front 9" is rendered above the scorecard

#### Scenario: Entry buttons rendered for commissioners
- **WHEN** `entryButton` prop is provided
- **THEN** each slot row in the scorecard receives the button rendered by `entryButton`

#### Scenario: No entry buttons for non-commissioners
- **WHEN** `entryButton` is not provided
- **THEN** no action buttons appear in the scorecard rows

### Requirement: ScorecardView uses ScorecardPanel
`ScorecardView.tsx` SHALL remove the `renderScorecard` local function and replace each call site with a `<ScorecardPanel />` element. The `buildSlotScores` helper may remain in `ScorecardView.tsx` or move to `ScorecardPanel.tsx` — either is acceptable as long as it is not duplicated.

#### Scenario: ScorecardView contains no renderScorecard function
- **WHEN** `ScorecardView.tsx` is read
- **THEN** there is no `renderScorecard` local function; the render is delegated to `ScorecardPanel`
