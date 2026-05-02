## Why

After Auth0 login the user lands on `/` with no guidance, and authenticated users who manually visit `/` or `/login` see a page meant for strangers. Fixing the routing now makes the upcoming landing page and `/me` redesign easier to test correctly.

## What Changes

- After a successful Auth0 callback, redirect to `/me` instead of `/`
- If an authenticated user visits `/` or `/login`, redirect them to `/me`
- If an unauthenticated user visits `/`, redirect them to `/login`
- The existing redirect from `/me` → `/login` for unauthenticated users is unchanged

## Capabilities

### New Capabilities

- `auth-routing`: Rules governing where users are sent based on authentication state and the page they are visiting

### Modified Capabilities

(none — existing `/me` → `/login` redirect behavior is unchanged)

## Impact

- `web/proxy.ts` — add unauthenticated `/` → `/login` redirect and authenticated `/` + `/login` → `/me` redirect in auth0 mode
- `web/lib/auth0.ts` — pass `returnTo: "/me"` so the Auth0 SDK redirects there after callback
- `web/app/page.tsx` — may simplify or become a passthrough once proxy handles the redirect
