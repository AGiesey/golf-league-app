## Why

The `/me` page currently renders raw, unstyled HTML — a plain heading, paragraph, and an anchor tag — giving authenticated users no sense of polish after login. Now that the design system and login page are styled, the profile page is the obvious next gap.

## What Changes

- Replace the bare `/me` page markup with design system components: Card for layout, Typography for headings, Badge for membership details, and a proper Button for logout
- Present golfer profile (name, course) and league memberships in a clear visual hierarchy
- Replace the unstyled `<a href="/api/auth/logout">` with a styled logout Button

## Capabilities

### New Capabilities

- `me-page`: Visual and content requirements for the authenticated golfer profile page

### Modified Capabilities

<!-- No existing spec-level behavior changes — routing and data fetching stay the same -->

## Impact

- `web/app/me/page.tsx` — full replacement of JSX markup; data fetching and auth logic unchanged
- No API, DB, or routing changes
