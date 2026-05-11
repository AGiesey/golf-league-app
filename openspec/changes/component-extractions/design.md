## Context

This is a pure refactoring change. No behavior, API, or data model changes are involved. Every extraction preserves the exact props that the parent currently passes inline; the parent simply delegates to a named component instead of rendering the block itself.

## Goals / Non-Goals

**Goals:**
- Each extracted component has a single, clear set of props and a single render responsibility
- No file in the target set keeps duplicated logic or oversized render blocks after the change
- All extractions follow existing conventions: composites in `components/`, page-local components collocated with their page file or in a nearby directory

**Non-Goals:**
- Changing any component's behavior, output HTML, or styling
- Introducing shared state, context, or hooks that don't already exist
- Refactoring anything beyond the six identified sections

## Decisions

### File placement

| Component | Location | Reason |
|---|---|---|
| `LeagueHeader` | `components/dashboard/LeagueHeader.tsx` | Shared across multiple dashboard render paths; `components/dashboard/` already exists |
| `ScoreStatusBadge` | `components/scorecard/ScoreStatusBadge.tsx` | Score-status concept belongs with scorecard primitives; used by two separate page files |
| `MatchupFormDialog` | `app/(app)/commissioner/matchups/MatchupFormDialog.tsx` | Tightly coupled to matchup data types; collocated with its only consumer |
| `MatchupListItem` | `app/(app)/commissioner/matchups/MatchupListItem.tsx` | Same — collocated with `MatchupsClient.tsx` |
| `TeamCard` | `app/(app)/commissioner/season/TeamCard.tsx` | Collocated with `TeamsTab.tsx`, its only consumer |
| `ScorecardPanel` | `components/scorecard/ScorecardPanel.tsx` | Reusable wrapper over `Scorecard`; lives with the other scorecard composites |

### MatchupFormDialog: Dialog primitive

The current inline dialog uses a raw `<div>` with `position: fixed` and a black/40 overlay. The `Dialog` primitive from `components/ui/dialog` handles focus trap, Escape key, aria-modal, and overlay consistently with the rest of the app. Switching to it during extraction costs no additional work and removes a known accessibility gap.

### ScoreStatusBadge: colour tokens

Both scores pages currently override Badge colour with raw classes (`bg-success-500 text-white hover:bg-success-500`, `bg-warning-500 text-white`). The extracted component keeps this as-is — fixing the token usage is a separate design-system concern, not in scope here.

## Risks / Trade-offs

No behavioral risk — extractions are mechanical. The one non-trivial change is `MatchupFormDialog` switching from a raw div overlay to the Dialog primitive; this changes focus management and Escape handling (improvements, not regressions). All other extractions are structurally identical to what was inline.
