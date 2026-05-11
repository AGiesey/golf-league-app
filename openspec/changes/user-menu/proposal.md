## Why

The app header currently shows only a bare "Log out" link with no user identity context, and "My Profile" is buried in the sidebar — neither location is cohesive or discoverable. Consolidating identity and account actions into a single, always-visible user menu in the top-right of the header is a standard shell pattern that surfaces who is logged in and gives every account action a natural home.

## What Changes

- A new `UserMenu` composite component is added at `web/components/user-menu.tsx`. It is the single source of all account-related header actions.
- `TopNav` gains a `userMenuSlot?: React.ReactNode` prop and removes its hardcoded logout link. The `ml-auto` area now renders whatever is placed in `userMenuSlot`.
- `Shell` gains a `golferName: string` prop and renders `<UserMenu>` into `TopNav`'s `userMenuSlot`, composing identity and commissioner state at the shell level.
- `Sidebar` removes "My Profile" from its nav list. No other identity-related items remain in the sidebar.
- **BREAKING** (internal): callers of `Shell` must now pass `golferName`. Any page/layout that renders `Shell` without a golfer name (e.g., the not-yet-registered empty state) renders no user menu (the component returns null for an empty string).

## Capabilities

### New Capabilities

- `user-menu`: A composite header component that shows the authenticated user's avatar and name as a dropdown trigger, with "My Profile" and "Log out" as actions. Commissioner identity is surfaced inside the dropdown, not in the always-visible trigger.

### Modified Capabilities

- `sidebar-nav`: "My Profile" is removed from the sidebar nav list. The sidebar now contains only destination-type nav links (Dashboard, Scores/Rounds, Commissioner → Season).

## Impact

- **`web/components/layout/TopNav.tsx`**: add `userMenuSlot` prop, remove hardcoded logout link.
- **`web/components/layout/Shell.tsx`**: add `golferName` prop, wire `UserMenu` into `TopNav`.
- **`web/components/layout/Sidebar.tsx`**: remove "My Profile" from `NavList`.
- **`web/components/user-menu.tsx`**: new file (composite component, not in `components/ui/`).
- **`web/docs/design-system.md`**: document `UserMenu` composite and `TopNav`'s new `userMenuSlot`.
- **`docs/auth-and-league-context.md`**: add explicit note that `LeagueContext` does not surface golfer display name; callers must join to `Golfer`.
- **`docs/authorization.md`**: no change required — "My Profile" moving is a layout change, not an authorization change. Verified: the sidebar change removes a nav link; it does not add, remove, or alter any authorization rule. The `/me` route is already accessible to any authenticated user with a resolved context, and that remains true.
- All call sites of `Shell` (layouts under `app/`) need the `golferName` prop threaded through from wherever they resolve league context.
