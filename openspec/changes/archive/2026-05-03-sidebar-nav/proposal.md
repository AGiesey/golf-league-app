## Why

The sidebar currently renders with empty nav slots — authenticated users have no way to navigate between pages other than manually typing URLs. This change populates the sidebar with role-aware navigation so the app is actually usable.

## What Changes

- Add nav items to the sidebar: Dashboard, My Profile, Scores/Rounds (placeholder), and a Commissioner section
- The Commissioner section is only visible to users whose resolved league context has `isCommissioner: true`
- The sidebar highlights the active route
- Regular golfers see: Dashboard, My Profile, Scores/Rounds
- Commissioners see all of the above plus a Commissioner section

## Capabilities

### New Capabilities

- `sidebar-nav`: Role-aware navigation in the left sidebar — links, active-state highlighting, and commissioner-only section

### Modified Capabilities

- `dashboard`: The dashboard server component must pass `isCommissioner` down to the shell so the sidebar can render the commissioner section without making its own API call

## Impact

- `web/components/layout/Sidebar.tsx` — populated with nav items
- `web/app/(app)/layout.tsx` — needs to resolve league context and pass `isCommissioner` to the shell
- `web/components/layout/Shell.tsx` — needs to accept and forward `isCommissioner` to `Sidebar`
- No API changes required
