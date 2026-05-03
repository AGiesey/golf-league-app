## Context

The Shell renders a `Sidebar` component that currently has empty nav slots. The sidebar is a client component (needs `useSidebar` for mobile collapse). The `(app)` layout renders the Shell — it already wraps every authenticated page, making it the right place to resolve context once and pass the result down.

The league context (`isCommissioner`) is already resolved per-request by `resolveLeagueContext()` in `lib/leagueContext.ts`. The challenge is that `Sidebar` is a client component but `isCommissioner` lives server-side. The solution is to pass it as a prop through the server component chain and into the client component.

## Goals / Non-Goals

**Goals:**
- Populate the sidebar with Dashboard, My Profile, Scores/Rounds, and Commissioner nav items
- Show the Commissioner section only when `isCommissioner` is true
- Highlight the active route
- Work across both desktop (static) and mobile (overlay) sidebar variants

**Non-Goals:**
- Building out the Commissioner or Scores/Rounds destination pages — links to unbuilt routes are rendered as placeholders
- Collapsible nav groups or nested sub-items
- Per-page sidebar customisation

## Decisions

### Pass `isCommissioner` as a prop, not via context or a separate fetch

The `(app)/layout.tsx` server component calls `resolveLeagueContext()` and passes `isCommissioner` as a prop to `Shell`, which forwards it to `Sidebar`. This keeps the data flow explicit and avoids a second API call inside the client component.

Alternative considered: read context in a separate client-side hook or React context. Rejected — adds complexity and a client-side fetch waterfall for data we already have server-side.

### `Sidebar` stays a client component

It needs `useSidebar()` for the mobile collapse toggle. The nav items themselves are purely presentational given `isCommissioner` is passed in as a prop, so there's no conflict.

### Active route highlighting via `usePathname`

Next.js's `usePathname()` hook (client-side) gives the current path. A nav item is highlighted when the current path starts with its `href`. This works for both exact matches (`/dashboard`) and future nested routes (`/commissioner/...`).

### Scores/Rounds as a disabled placeholder

The route doesn't exist yet. Render the item visually but non-interactive (no `href`, muted style) so the nav structure is established and the item can be enabled when the route is built.

## Risks / Trade-offs

- **`(app)/layout.tsx` now calls `resolveLeagueContext()` on every render** — this is an extra API call per page load (the dashboard also calls it). The double-call is acceptable for now; a future caching or React cache() layer can eliminate it. → Mitigation: document the duplication, address in a future caching change.
- **Commissioner section disappears if context can't be resolved** — if `resolveLeagueContext()` returns null or throws in the layout, we degrade to `isCommissioner: false` (no commissioner link shown). The page itself still handles the auth redirect, so this is safe.
