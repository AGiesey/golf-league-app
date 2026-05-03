## Why

The `/login` page currently renders a plain `<h1>Sign in</h1>` and an unstyled anchor link, giving first-time visitors no sense of what the app is or why they should sign in. A polished landing page builds credibility and communicates value before the user commits to logging in.

## What Changes

- Replace the bare `/login` page with a styled landing page using the existing design system (shadcn/ui, Tailwind, established color tokens)
- The page communicates the app's purpose (golf league management) and has a prominent, styled sign-in call-to-action
- The `/dev/login` mock page is unchanged

## Capabilities

### New Capabilities

- `unauthenticated-landing`: Visual design and content requirements for the unauthenticated landing/login page

### Modified Capabilities

- `auth-routing`: No requirement changes — routing behavior (`/` → `/login` for unauthenticated users) stays the same; only the page content changes

## Impact

- `web/app/login/page.tsx` — full replacement of page content
- No API, DB, or routing changes
