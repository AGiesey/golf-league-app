## Context

The app shell currently has no first-class identity surface. The authenticated user's name and avatar appear nowhere in the header; the only account-level action (logout) is a bare link in the top-right corner. "My Profile" is reachable only through the sidebar, which collapses on mobile. These are three separate, unrelated UI fragments where one cohesive component belongs.

The `LeagueContext` shape is server-derived and already carries `isCommissioner`. It does not carry the golfer's display name — that lives on the `Golfer` entity and must be joined by whatever server component resolves context before rendering `Shell`. This is an existing pattern (the dashboard already fetches league name for display); the user menu simply adds golfer name to the same resolution step.

The design system has all required primitives: `Avatar` (with `AvatarFallback` for initials), `DropdownMenu`, `Badge`, and `Separator`. A composite that composes these belongs in `components/` (not `components/ui/`).

## Goals / Non-Goals

**Goals:**
- One `UserMenu` component owns all account-level header actions: avatar trigger, name display, "My Profile", and "Log out"
- `TopNav` becomes a dumb slot-based layout component — it does not make identity decisions
- `Shell` is the composition point: it receives identity from its caller and wires `UserMenu` into `TopNav`
- "My Profile" is removed from the sidebar, leaving the sidebar as a pure destination-nav list
- The design accommodates future items (Settings, theme toggle, league switcher) without restructuring

**Non-Goals:**
- Profile editing UI
- Avatar upload / image storage
- Per-user avatar color
- League switching UI (noted in spatial layout below, not implemented)
- Settings or theme toggle
- Notification affordances

## Decisions

### Decision 1: `UserMenu` is a composite in `components/`, not a primitive in `components/ui/`

The design system rule is that composites go in `components/`, primitives go in `components/ui/`. `UserMenu` composes `Avatar`, `DropdownMenu`, and `Badge` — it is unambiguously a composite. It does not belong in the shadcn-owned `ui/` directory.

**Alternatives considered**: Inlining the menu directly in `TopNav`. Rejected — it couples identity logic to a layout component, making both harder to test and reuse independently.

### Decision 2: `TopNav` receives a `userMenuSlot` prop rather than `golferName` directly

`TopNav` is a layout component. If it accepted `golferName` and `isCommissioner`, it would need to know how to render a `UserMenu` — that is composition logic that belongs one level up in `Shell`. The slot prop keeps `TopNav` ignorant of identity concerns.

`navSlot` already follows this pattern for role-aware nav links. `userMenuSlot` is parallel: same pattern, right side of the header.

**Alternatives considered**: Passing identity directly to `TopNav` and rendering `UserMenu` there. Rejected — makes `TopNav` a composition point for two unrelated concerns (layout and identity).

### Decision 3: Avatar shows initials (`FI + LI`) on `bg-muted` / `text-muted-foreground`

`AvatarFallback` displays initials extracted from `golferName` (first character of first word + first character of last word, uppercased). Background is `bg-muted`, foreground is `text-muted-foreground` — neutral token values that sit quietly in the header without competing with primary-color elements.

Per-user color assignment is deferred. A consistent neutral background is fine for MVP and requires no additional state or computation.

**Alternatives considered**: Per-user color derived from name hash. Deferred — adds complexity with no user-visible benefit at MVP roster sizes. Solid `bg-primary` background. Rejected — too visually heavy for a persistent header element.

### Decision 4: Name in trigger shows first name only at `sm+`; avatar-only at `xs`

First name is sufficient for identity recognition in a small header element. Full name and "First L." both add length without adding clarity. At mobile widths (`< sm`, i.e., `< 640px`) the name is hidden with `hidden sm:inline` and the avatar alone identifies the trigger.

**Alternatives considered**: Full name always visible. Rejected — header space is tight on mid-size screens. "First L." format. Rejected — awkward visually and adds character-counting complexity.

### Decision 5: Commissioner badge appears only in the dropdown header, not in the trigger

The sidebar already shows the Commissioner nav section when `isCommissioner` is true — the role is already surfaced in the UI. Doubling it up in the trigger adds visual noise to an element that is always visible and already small. The dropdown header (full name + badge) is a natural place for contextual role information: it is seen when the user is about to take an action, not persistently.

**Alternatives considered**: Badge on avatar in trigger. Rejected — avatar is small; a badge competes with the initials and reads poorly at small sizes.

### Decision 6: Dropdown extensibility via a well-known insertion point

The dropdown structure is:

```
[Header: Full Name + optional Commissioner badge]
[Separator]
  My Profile
[Separator]        ← future items inserted above this separator
  Log out
```

Future items (Settings, theme toggle, etc.) are inserted between "My Profile" and the final separator. The "Log out" and its preceding separator are the fixed bottom of the menu. This matches the mental model users have from other apps: destructive/exit actions at the bottom, utility actions above.

### Decision 7: Empty-name guard — no menu for unregistered users

If `golferName` is an empty string, `UserMenu` returns `null`. This handles the "authenticated but not registered" empty state without a special prop. The header shows no user menu in this state. Callers that know the user is not registered can pass `""` explicitly. This is preferable to a boolean `isRegistered` prop that duplicates the same information.

### Decision 8: `Shell` is the golfer-name resolution boundary

`Shell` accepts `golferName: string`. The server component (layout or page) that renders `Shell` is responsible for fetching the golfer's display name. This is consistent with how `isCommissioner` already works: the caller resolves context, extracts what `Shell` needs, and passes it as props. `Shell` does not fetch.

## Risks / Trade-offs

`Shell` call sites must be updated to pass `golferName` → TypeScript will enforce this; no runtime risk. This is a small blast radius (a handful of layout files under `app/`).

`LeagueContext` not surfacing golfer name is documented but easy to forget → The proposal adds an explicit note to `auth-and-league-context.md` flagging this gap so future contributors know to join `Golfer` before rendering identity.

Sidebar "My Profile" removal is a regression for any user who relied on it → The link is now in the dropdown, one click further but in a more discoverable location. Acceptable trade for MVP.

## Migration Plan

No database changes, no API changes, no cookie changes. This is a pure UI change. Deployment is a standard frontend deploy — no migration steps required, no rollback procedure beyond reverting the frontend build.
