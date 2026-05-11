## 1. UserMenu Component

- [x] 1.1 Create `web/components/user-menu.tsx` — client component that accepts `golferName: string` and `isCommissioner: boolean` props; returns null when `golferName` is empty
- [x] 1.2 Implement initials extraction helper (first char of first word + first char of last word, uppercased)
- [x] 1.3 Build the avatar trigger: `Avatar` with `AvatarFallback` (initials, `bg-muted`, `text-muted-foreground`), `aria-hidden="true"` on fallback, first name visible at `sm+` via `hidden sm:inline`
- [x] 1.4 Wire trigger as `DropdownMenuTrigger` with `aria-label="Account menu for [golfer name]"` on the inner button element
- [x] 1.5 Build the dropdown content: header section (full name + optional `Badge` variant `secondary` labelled "Commissioner"), `Separator`, "My Profile" `DropdownMenuItem` → `/me`, `Separator`, "Log out" `DropdownMenuItem` → `/api/auth/logout`
- [x] 1.6 Apply `shadow-popover` to `DropdownMenuContent`; ensure item min-height satisfies 44px touch target
- [x] 1.7 Confirm no raw color, size, or shadow values — tokens only

## 2. TopNav Changes

- [x] 2.1 Add `userMenuSlot?: React.ReactNode` prop to `TopNavProps` interface in `web/components/layout/TopNav.tsx`
- [x] 2.2 Remove the hardcoded `<a href="/api/auth/logout">Log out</a>` link from `TopNav`
- [x] 2.3 Render `{userMenuSlot}` inside the `<div className="ml-auto">` container in place of the removed logout link

## 3. Shell Changes

- [x] 3.1 Add `golferName: string` prop to `Shell`'s props interface in `web/components/layout/Shell.tsx`
- [x] 3.2 Import `UserMenu` in `Shell` and render `<UserMenu golferName={golferName} isCommissioner={isCommissioner} />` as the `userMenuSlot` passed to `TopNav`

## 4. Sidebar Changes

- [x] 4.1 Remove `{ label: "My Profile", href: "/me" }` from `NavList` items in `web/components/layout/Sidebar.tsx`
- [x] 4.2 Verify no other identity-related items remain in `NavList`

## 5. Call-Site Updates

- [x] 5.1 Identify all layouts and pages under `web/app/` that render `Shell`
- [x] 5.2 For each call site, thread `golferName` through — fetched from the `Golfer` record at the same point where `isCommissioner` is resolved from `LeagueContext`
- [x] 5.3 Pass `golferName=""` (empty string) for any call site where the user is authenticated but has no `Golfer` record (the "not registered" empty state)

## 6. Documentation Updates

- [x] 6.1 Update `web/docs/design-system.md` — add a "Composites" subsection to the Layout component table documenting `UserMenu` (file path, props: `golferName: string`, `isCommissioner: boolean`); add a note to the `TopNav` row that it now accepts `userMenuSlot?: React.ReactNode`
- [x] 6.2 Update `docs/auth-and-league-context.md` — add an explicit note under the `LeagueContext` shape that `golferName` is NOT on the context; callers must join to `Golfer` to get display name before rendering `Shell`
- [x] 6.3 Confirm `docs/authorization.md` requires no update (the "My Profile" move is a layout change, not an authorization change) and leave a brief inline note in the proposal confirming this was verified
