## 1. Thread isCommissioner through the shell

- [x] 1.1 Update `web/app/(app)/layout.tsx` to call `resolveLeagueContext()` and extract `isCommissioner` (default `false` on null or error), passing it to `Shell`
- [x] 1.2 Update `web/components/layout/Shell.tsx` to accept an `isCommissioner` prop and forward it to `Sidebar`

## 2. Populate the sidebar

- [x] 2.1 Update `web/components/layout/Sidebar.tsx` to accept an `isCommissioner` prop and render nav items: Dashboard (`/dashboard`), My Profile (`/me`), Scores/Rounds (disabled placeholder), and a Commissioner item shown only when `isCommissioner: true`
- [x] 2.2 Add active route highlighting using `usePathname()` — highlight the item whose `href` matches the start of the current path

## 3. Verify

- [x] 3.1 Log in as a commissioner — confirm Dashboard, My Profile, Scores/Rounds placeholder, and Commissioner item all appear in the sidebar
- [x] 3.2 Log in as a regular golfer — confirm Commissioner item is absent
- [x] 3.3 Confirm active item is highlighted when navigating between Dashboard and My Profile
