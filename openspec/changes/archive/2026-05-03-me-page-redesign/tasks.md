## 1. Redesign /me page

- [x] 1.1 Replace the happy-path JSX in `web/app/me/page.tsx` with a two-Card layout: profile card (name + course) and memberships card, using design system components
- [x] 1.2 Replace the unstyled logout anchor with a Button-styled `<a>` using `buttonVariants`
- [x] 1.3 Fix the nested `<main>` issue — change the page's root element from `<main>` to `<div>`

## 2. Verify

- [x] 2.1 Log in and confirm the profile card shows full name and course name
- [x] 2.2 Confirm the memberships card lists league memberships (or shows the empty state)
- [x] 2.3 Confirm the logout button is visually styled and navigates to `/api/auth/logout`
