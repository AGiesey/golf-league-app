## Why

The dev login page (`/dev/login`) was built to satisfy functional auth requirements but was left completely unstyled — raw `<main>`, `<h1>`, `<ul>`, and `<button>` elements with no design system tokens. Now that the design system is fully implemented (tokens, shadcn/ui primitives, typography components, layout shell), the login page should reflect that work and serve as a consistent entry point into the app.

## What Changes

- Replace raw HTML elements on `/dev/login` with design system components (Card, Button, Typography)
- Replace unstyled `<ul>/<li>/<button>` golfer list with styled golfer cards/buttons using the primary token palette
- Apply page-level layout centering appropriate for an auth-style landing page
- Replace bare `<h1>` with H1 / Lead typography components

## Capabilities

### New Capabilities

- `dev-login-page-styled`: Visual presentation requirements for the `/dev/login` page — defines what the styled golfer selection UI must look like using design system components.

### Modified Capabilities

_(none — the functional requirements for the dev login page in `golfer-auth` are unchanged; only the visual implementation changes)_

## Impact

- `web/app/dev/login/page.tsx` — markup and component imports updated
- `web/app/dev/login/GolferSelector.tsx` — markup and component imports updated
- No API, database, or backend changes
- No changes to cookies, redirects, or auth behavior
