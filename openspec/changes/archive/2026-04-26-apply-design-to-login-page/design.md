## Context

The design system (tokens, shadcn/ui primitives, typography components, layout shell) is fully implemented. The dev login page at `/dev/login` was built only for functional correctness and left with raw HTML. It currently renders an unstyled `<h1>` and a plain `<ul>` of `<button>` elements — no tokens, no primitives, no typography components.

The change involves two files:
- `web/app/dev/login/page.tsx` (server component, fetches golfer list)
- `web/app/dev/login/GolferSelector.tsx` (client component, handles golfer selection click)

## Goals / Non-Goals

**Goals:**
- Replace all raw HTML on the login page with design system components
- Center the page visually as an auth-style landing layout (card centered on screen)
- Use Card, Button, Typography (H1/Lead/Muted), and Avatar primitives from the design system
- Maintain all existing behavior (cookie set, redirect to `/me`)

**Non-Goals:**
- No changes to the login API route or cookie logic
- No changes to how golfers are fetched
- No production auth UI (this page is dev-only under `AUTH_PROVIDER=mock`)
- No new routes, no new components beyond what the two existing files need

## Decisions

### Decision: Card-centered layout

The page will render a centered Card containing the golfer list, consistent with how auth pages typically look — visually distinct from the app shell content area. The Card sits centered vertically and horizontally on the page against the neutral background.

**Alternative considered**: Full-width list inside the app shell content area. Rejected because auth pages conventionally stand apart from the main layout chrome.

### Decision: One Button per golfer, not list items

Replace `<ul>/<li>/<button>` with a vertical stack of full-width `<Button variant="outline">` components inside the Card. Each button shows the golfer's name and email using inline typography.

**Alternative considered**: A Table with a click row. Rejected as over-engineered for a dev-only utility screen with a handful of golfers.

### Decision: Avatar initials for visual anchoring

Render a small `<Avatar>` with initials (`firstInitial + lastInitial`) to the left of each golfer's name. Uses the existing `Avatar`/`AvatarFallback` primitive — no new dependencies.

**Alternative considered**: No avatar. Acceptable, but initials provide a quick visual scan for developers who use this page repeatedly.

### Decision: No spec changes to golfer-auth

The functional requirements (cookie, redirect, 404 outside mock mode) are not changing. Only visual presentation is changing. The new `dev-login-page-styled` spec captures the visual requirements separately.

## Risks / Trade-offs

- [Minimal risk] The login page is dev-only — visual regressions don't affect production users and are easy to spot manually.
- [No migration needed] No data or API changes; purely additive visual work.
