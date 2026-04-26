## 1. Tailwind Setup

- [ ] 1.1 Check the installed Tailwind version: `npm info tailwindcss version` in the web container (or locally). Confirm v4 or v3 and note it in a comment in the config.
- [ ] 1.2 Install Tailwind and its Next.js integration: `npm install tailwindcss @tailwindcss/postcss` (v4) or `npm install tailwindcss postcss autoprefixer` + `npx tailwindcss init -p` (v3).
- [ ] 1.3 Configure PostCSS (v4: `postcss.config.mjs` with `@tailwindcss/postcss`; v3: `postcss.config.js` with tailwindcss + autoprefixer).
- [ ] 1.4 Add the Tailwind directives to `globals.css` (`@import "tailwindcss"` for v4 or `@tailwind base/components/utilities` for v3).
- [ ] 1.5 Confirm Tailwind is working: add a test utility class to `app/page.tsx`, run the dev server, verify the class applies, then remove it.

## 2. Design Tokens

- [ ] 2.1 Define the color tokens in `globals.css` (v4 `@theme` block) or `tailwind.config.ts` (v3 `theme.extend.colors`):
  - `primary` scale: fairway green (50–900); primary-foreground
  - `secondary` scale: warm sand/khaki (50–900); secondary-foreground
  - `neutral` scale: warm gray with slight green undertone (50–900)
  - `success`, `warning`, `danger`, `info` semantic scales (50–900)
- [ ] 2.2 Define typography tokens: `fontFamily.sans` (Inter, set up in step 3), constrained `fontSize` scale (xs through 4xl with matching line heights).
- [ ] 2.3 Define spacing, border-radius tokens: sm=4px, md=6px, lg=8px, xl=12px.
- [ ] 2.4 Define shadow tokens: `shadow-card`, `shadow-popover`, `shadow-modal` (three elevations only).
- [ ] 2.5 Define motion tokens: `transitionDuration.fast` = 150ms, `transitionDuration.base` = 200ms; add `prefers-reduced-motion` rule in globals.css.
- [ ] 2.6 Map shadcn's expected CSS variables (`--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--background`, `--foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--destructive`, `--destructive-foreground`, `--accent`, `--accent-foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`) to our token values in the `:root` block of `globals.css`.

## 3. Font

- [ ] 3.1 Install Inter via `next/font/google` in `app/layout.tsx`; set `variable: '--font-sans'` and `subsets: ['latin']`.
- [ ] 3.2 Apply the font variable to the `<html>` element in the root layout.
- [ ] 3.3 Wire `fontFamily.sans` token to `var(--font-sans)` in the Tailwind config / `@theme` block.

## 4. shadcn/ui Initialization

- [ ] 4.1 Run `npx shadcn@latest init` inside the web directory; choose: TypeScript, app router, `@/` path alias, `globals.css` for CSS, no RSC import (components ship as-is).
- [ ] 4.2 Verify `components.json` is created with correct paths (`components/ui`, `lib/utils`).
- [ ] 4.3 Confirm `lib/utils.ts` exists with the `cn()` helper (clsx + tailwind-merge).
- [ ] 4.4 Verify `tsconfig.json` includes the `@/*` path alias pointing to the web root.

## 5. Install Primitive Components

- [ ] 5.1 `npx shadcn@latest add button`
- [ ] 5.2 `npx shadcn@latest add input`
- [ ] 5.3 `npx shadcn@latest add label`
- [ ] 5.4 `npx shadcn@latest add select`
- [ ] 5.5 `npx shadcn@latest add checkbox`
- [ ] 5.6 `npx shadcn@latest add dialog`
- [ ] 5.7 `npx shadcn@latest add dropdown-menu`
- [ ] 5.8 `npx shadcn@latest add toast` (or `sonner` — check which shadcn recommends for the installed version)
- [ ] 5.9 `npx shadcn@latest add card`
- [ ] 5.10 `npx shadcn@latest add table`
- [ ] 5.11 `npx shadcn@latest add tabs`
- [ ] 5.12 `npx shadcn@latest add badge`
- [ ] 5.13 `npx shadcn@latest add avatar`
- [ ] 5.14 `npx shadcn@latest add separator`
- [ ] 5.15 `npx shadcn@latest add skeleton`
- [ ] 5.16 `npx shadcn@latest add form` (installs react-hook-form + @hookform/resolvers + zod)

## 6. Typography Component Set

- [ ] 6.1 Create `web/components/typography/index.tsx` exporting `H1`, `H2`, `H3`, `H4`, `Lead`, `Body`, `Muted`, `Code` components. Each applies the correct token-driven Tailwind classes for size, weight, line height, and color.

## 7. Theme Provider

- [ ] 7.1 Install `next-themes`: `npm install next-themes`.
- [ ] 7.2 Create `web/components/providers/ThemeProvider.tsx` as a client component wrapping `next-themes` `ThemeProvider` with `attribute="class"` and `defaultTheme="light"` and `enableSystem={false}`.
- [ ] 7.3 Wrap the root layout children with `ThemeProvider`.

## 8. Layout Shell

- [ ] 8.1 Create `web/components/layout/TopNav.tsx` — server component; includes logo slot (text "Golf League" placeholder), navigation slot (empty), and a mobile sidebar toggle button.
- [ ] 8.2 Create `web/components/layout/Sidebar.tsx` — responsive; persistent on desktop (md+), hidden on mobile with a toggle. Uses a client component for toggle state.
- [ ] 8.3 Create `web/components/layout/Shell.tsx` — server component composing TopNav, Sidebar, and the content area (`<main>` with consistent padding and max-width).
- [ ] 8.4 Replace the existing root layout body content in `app/layout.tsx` with `<Shell>{children}</Shell>`. Keep font variable, ThemeProvider, and Toaster wiring.

## 9. Toast Provider

- [ ] 9.1 Wire the Toaster component (from shadcn's toast or sonner) inside `app/layout.tsx`, inside `ThemeProvider`, outside `Shell` so toasts render above the layout.

## 10. `/design` Catalogue Route

- [ ] 10.1 Create `web/app/design/page.tsx` — server component.
- [ ] 10.2 Add a section for each primitive showing: component name, all documented variants side by side, and the relevant token names it uses.
- [ ] 10.3 Add a typography section showing H1–H4, Lead, Body, Muted, Code rendered in sequence.
- [ ] 10.4 Add a color palette section showing swatches for each token group (primary, secondary, neutral, semantic scales).

## 11. Documentation

- [ ] 11.1 Create `web/docs/design-system.md` covering:
  - Token reference table (name → intent → current value)
  - Component inventory (name, import path, key variants)
  - How to add a new component (shadcn add → verify token usage → add to `/design` route → update this doc)
  - The rule: components consume tokens, never raw values

## 12. Smoke Test

- [ ] 12.1 Run `docker compose up -d --build` and confirm all three services start cleanly.
- [ ] 12.2 Navigate to `/` — confirm page renders inside the layout shell, no functional regression.
- [ ] 12.3 Navigate to `/dev/login` — confirm golfer selector works and login redirects to `/me`.
- [ ] 12.4 Navigate to `/me` — confirm golfer profile and memberships render correctly inside the shell.
- [ ] 12.5 Navigate to `/design` — confirm all primitives and typography styles render.
- [ ] 12.6 Resize to mobile viewport — confirm sidebar collapses and toggle is present.
