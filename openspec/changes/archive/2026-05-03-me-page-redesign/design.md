## Context

The `/me` page is a server component that fetches golfer data from the API (`/me` endpoint) and renders it. It already handles auth errors (401 → redirect to login, 403 → unregistered account message). The data shape is: `{ firstName, lastName, email, course: { name }, memberships: [{ leagueName, seasonYear }] }`. The design system has Card, Badge, Button, and Typography primitives available.

## Goals / Non-Goals

**Goals:**
- Use Card to structure the profile and membership sections
- Use Typography components for consistent heading hierarchy
- Replace the unstyled logout anchor with a Button styled as a destructive/outline variant
- Keep error states (401, 403) functional — only the happy path markup changes

**Non-Goals:**
- Adding new API fields or changing the data model
- Avatar / profile photo (no image data available)
- Editing profile information
- Changing auth or routing logic

## Decisions

**Two-Card layout** — A profile card (name + course) and a memberships card below it, both within the existing Shell content area. Alternatives: single card with sections (more compact but harder to scan), table layout (overkill for MVP).

**Badge for membership rows** — Each membership shows `leagueName — seasonYear` in a simple list; the season year gets a Badge to add visual structure without extra complexity.

**Logout as outline Button** — The logout action uses `variant="outline"` rather than `variant="destructive"` to keep it visible but not alarming. It navigates to `/api/auth/logout` via an `<a>` wrapped in `buttonVariants`, same pattern as the login page CTA.

**Error states unchanged** — The 401 and 403 catch blocks are untouched. Only the happy-path `return` is replaced.

## Risks / Trade-offs

- [Nested `<main>` elements] → The Shell already renders a `<main>`; the `/me` page also renders `<main>`. Change to `<div>` in the page to fix the nesting. Minor HTML correctness fix bundled in.
- [Badge import adds a dependency] → Badge is already in the design system (`components/ui/badge.tsx`), no new dependency.
