## 1. API — Commissioner authorization policy

- [ ] 1.1 Add a `Commissioner` authorization policy in `api/Program.cs` that reads `isCommissioner` from the golfer context and returns 403 if false
- [ ] 1.2 Register a `/commissioner` route group in `api/Program.cs` that requires the `Commissioner` policy

## 2. API — SeasonSetupStatus endpoint

- [ ] 2.1 Implement `GET /commissioner/season/setup-status` in the commissioner route group: query `LeagueMembership`, `TeamMembership`, and `Week` for the active season; compute and return `SeasonSetupStatus` with `isComplete`, and all three requirements (Roster, Teams, Schedule) each with `isMet` and `detail`

## 3. Web — Season nav item

- [ ] 3.1 Update `web/components/layout/Sidebar.tsx` to add a "Season" nav item linking to `/commissioner/season`, rendered only when `isCommissioner: true`, with active highlighting when the path starts with `/commissioner`

## 4. Web — /commissioner/season page

- [ ] 4.1 Create `web/app/(app)/commissioner/season/page.tsx` — server component that checks `isCommissioner` (redirect to `/dashboard` if false), fetches `GET /commissioner/season/setup-status`, and renders a tabbed layout (Roster, Teams, Schedule) with a status banner
- [ ] 4.2 Implement the status banner: success state when `isComplete`, unmet-requirements checklist with `detail` strings when not
- [ ] 4.3 Implement tab completion indicators: checkmark icon on each tab label when `isMet: true`, warning icon when `isMet: false`
- [ ] 4.4 Implement tab deep-linking via `?tab=` search param; default to Roster; each tab body is a placeholder

## 5. Web — Dashboard setup widget

- [ ] 5.1 Update `web/app/(app)/dashboard/page.tsx`: when `isCommissioner: true` and `SeasonSetupStatus.isComplete: false`, render a setup-incomplete widget showing the requirement checklist with `detail` strings and links to the appropriate `?tab=` on `/commissioner/season`
- [ ] 5.2 When `isCommissioner: false` and setup is incomplete, render a "league isn't ready yet" placeholder showing league name and season year

## 6. Verify

- [ ] 6.1 Log in as commissioner with an incomplete season — confirm dashboard shows setup widget with failing requirements and correct detail strings
- [ ] 6.2 Confirm each checklist item on the widget links to the correct tab on `/commissioner/season`
- [ ] 6.3 Confirm `/commissioner/season` shows the status banner, tab indicators, and placeholder tab bodies
- [ ] 6.4 Log in as a regular golfer with an incomplete season — confirm dashboard shows the "not ready" placeholder, not the setup widget
- [ ] 6.5 Confirm "Season" nav item appears in the sidebar for commissioners and is absent for regular golfers
- [ ] 6.6 Confirm `/commissioner/season` returns 403 via the API when called without a commissioner token
