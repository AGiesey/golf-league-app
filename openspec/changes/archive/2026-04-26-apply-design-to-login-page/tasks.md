## 1. Style the page server component

- [x] 1.1 Update `web/app/dev/login/page.tsx`: replace raw `<main>` wrapper with a centered full-viewport layout div using Tailwind utility classes (`min-h-screen flex items-center justify-center`)
- [x] 1.2 Wrap the page content in a `Card` with `CardHeader` (containing H1 title and Lead subtitle) and `CardContent` (containing `GolferSelector`)
- [x] 1.3 Import H1, Lead from `@/components/typography` and Card primitives from `@/components/ui/card`

## 2. Style the GolferSelector client component

- [x] 2.1 Replace the `<ul>/<li>` list with a `<div className="flex flex-col gap-2">` container
- [x] 2.2 Replace each raw `<button>` with a full-width `<Button variant="outline">` from `@/components/ui/button`
- [x] 2.3 Inside each Button, render an `<Avatar>` with `<AvatarFallback>` showing first + last initials alongside the golfer name and email
- [x] 2.4 Import `Avatar`, `AvatarFallback` from `@/components/ui/avatar`
- [x] 2.5 Verify clicking each golfer button still sets the cookie and redirects to `/me` (no logic changes)

## 3. Verify

- [x] 3.1 Run the dev server (`pnpm dev` in `web/`) and navigate to `/dev/login` — confirm the styled card layout renders correctly
- [x] 3.2 Click a golfer and confirm redirect to `/me` still works
