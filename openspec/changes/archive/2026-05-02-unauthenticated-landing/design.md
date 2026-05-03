## Context

The `/login` page is currently a minimal server component with a bare `<h1>` and an unstyled anchor tag. All pages render inside the Shell (TopNav + Sidebar + content area). The sidebar is empty for unauthenticated users but visually present on desktop. The design system provides Card, Button, and Typography primitives via shadcn/ui, plus established primary (fairway green) and neutral color tokens.

## Goals / Non-Goals

**Goals:**
- A polished, on-brand `/login` page that communicates the app's purpose
- Uses existing design system components — no new dependencies
- Looks good within the existing Shell layout

**Non-Goals:**
- Redesigning the Shell or hiding the sidebar for unauthenticated pages (out of scope)
- Marketing-style hero with background images or animations
- `/dev/login` mock page changes

## Decisions

**Keep the existing Shell** — The sidebar is empty for unauthenticated users, but adding a "hide sidebar on unauthenticated routes" feature is a separate concern. The login card will be centered in the content area, which looks reasonable as-is.

**Single centered Card** — A Card containing the app name, a brief tagline, and a sign-in Button is sufficient. Simple, on-brand, no over-engineering. Alternatives considered: full-bleed hero section (overkill for MVP), full-page centered layout bypassing the Shell (requires layout changes).

**Button component for sign-in CTA** — `<Button asChild><a href="/auth/login">Sign in with Auth0</a></Button>` uses the existing Button primitive with primary styling. No client-side JS needed.

**Static server component** — The page has no interactivity; it stays a server component with `export const dynamic = "force-dynamic"`.

## Risks / Trade-offs

- [Sidebar shows on desktop for unauthenticated users] → Acceptable for now; sidebar is empty and low-prominence
- [Card-centered layout feels modest compared to a full landing page] → Intentional for MVP; can be expanded later with a separate landing page proposal
