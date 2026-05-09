## 1. API — Commissioner authorization policy

- [x] 1.1 Add a `Commissioner` authorization policy in `api/Program.cs` that reads `isCommissioner` from the golfer context and returns 403 if false
- [x] 1.2 Register a `/commissioner` route group in `api/Program.cs` that requires the `Commissioner` policy

## 2. API — SeasonSetupStatus endpoint

- [x] 2.1 Implement `GET /commissioner/season/setup-status` in the commissioner route group: query `LeagueMembership`, `TeamMembership`, and `Week` for the active season; compute and return `SeasonSetupStatus` with `isComplete`, and all three requirements (Roster, Teams, Schedule) each with `isMet` and `detail`

## 3. Web — Season nav item

- [x] 3.1 Update `web/components/layout/Sidebar.tsx` to add a "Season" nav item linking to `/commissioner/season`, rendered only when `isCommissioner: true`, with active highlighting when the path starts with `/commissioner`

## 4. Web — /commissioner/season page

- [x] 4.1 Create `web/app/(app)/commissioner/season/page.tsx` — server component that checks `isCommissioner` (redirect to `/dashboard` if false), fetches `GET /commissioner/season/setup-status`, and renders a tabbed layout (Roster, Teams, Schedule) with a status banner
- [x] 4.2 Implement the status banner: success state when `isComplete`, unmet-requirements checklist with `detail` strings when not
- [x] 4.3 Implement tab completion indicators: checkmark icon on each tab label when `isMet: true`, warning icon when `isMet: false`
- [x] 4.4 Implement tab deep-linking via `?tab=` search param; default to Roster; each tab body is a placeholder

## 5. Web — Dashboard setup widget

- [x] 5.1 Update `web/app/(app)/dashboard/page.tsx`: when `isCommissioner: true` and `SeasonSetupStatus.isComplete: false`, render a setup-incomplete widget showing the requirement checklist with `detail` strings and links to the appropriate `?tab=` on `/commissioner/season`
- [x] 5.2 When `isCommissioner: false` and setup is incomplete, render a "league isn't ready yet" placeholder showing league name and season year

## 6. Verify

- [x] 6.1 Log in as commissioner with an incomplete season — confirm dashboard shows setup widget with failing requirements and correct detail strings
- [x] 6.2 Confirm each checklist item on the widget links to the correct tab on `/commissioner/season`
- [x] 6.3 Confirm `/commissioner/season` shows the status banner, tab indicators, and placeholder tab bodies
- [x] 6.4 Log in as a regular golfer with an incomplete season — confirm dashboard shows the "not ready" placeholder, not the setup widget
- [x] 6.5 Confirm "Season" nav item appears in the sidebar for commissioners and is absent for regular golfers
- [x] 6.6 Confirm `/commissioner/season` returns 403 via the API when called without a commissioner token
