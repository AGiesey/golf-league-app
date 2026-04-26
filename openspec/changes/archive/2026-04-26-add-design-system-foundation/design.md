## Context

The web app (Next.js 16, React 19, TypeScript) currently has no CSS framework, no shared components, and no design tokens. Tailwind is not yet installed. Three pages exist (`/`, `/dev/login`, `/me`) using bare HTML elements and a minimal `globals.css`. This change installs the entire styling stack and adds the layout chrome — existing pages are wrapped but not restyled.

## Goals / Non-Goals

**Goals:**
- Install Tailwind v4 and confirm it integrates cleanly with Next.js 16 / React 19
- Define all design tokens in `tailwind.config.ts` as the single source of truth
- Set up shadcn/ui with components copied into `/web/components/ui/` (owned, modifiable)
- Build the layout shell that wraps all pages
- Wire font, theme provider, and toast provider
- Ship a `/design` catalogue route and written design system docs

**Non-Goals:**
- Restyling any existing page (`/`, `/dev/login`, `/me`) — separate proposals
- Dark mode enabled — wired but disabled
- Role-aware navigation logic — slot is present but empty
- Storybook — `/design` route only at MVP

## Decisions

### D1: Tailwind v4

Tailwind v4 uses a CSS-first config — tokens are defined as CSS custom properties in a `@theme` block in the global CSS file, not in `tailwind.config.ts`. This is a breaking change from v3's JS config.

**Concretely:**
- Design tokens live in `globals.css` under `@theme { ... }` using the `--color-*`, `--font-*`, `--radius-*` naming conventions that Tailwind v4 generates utilities from.
- `tailwind.config.ts` is minimal or absent (Tailwind v4 auto-discovers content paths from the Next.js integration).
- The `@tailwindcss/vite` (or Next.js PostCSS plugin) replaces the old PostCSS setup.

**Verify at task 1:** run `npm info tailwindcss version` in the web container to confirm v4 is available. If v3 is the latest stable, follow the v3 config pattern instead (`tailwind.config.ts` JS object) and note the discrepancy here.

### D2: shadcn/ui initialization

Run `npx shadcn@latest init` inside the web directory to generate `components.json`, set up the `cn()` utility, and configure the path alias (`@/components`, `@/lib`). Components install to `/web/components/ui/`. The `tsconfig.json` path alias `@/*` maps to the web root.

shadcn/ui v3+ is compatible with Tailwind v4. If using v3 Tailwind, use the shadcn v2 compatibility path.

### D3: Design token palette

Tokens are defined as CSS custom properties in the Tailwind v4 `@theme` block (or `tailwind.config.ts` `theme.extend` in v3):

| Token group | Intent |
|---|---|
| `color.primary.*` | Fairway green — primary actions, active states |
| `color.secondary.*` | Warm sand/khaki — secondary surfaces, subtle highlights |
| `color.neutral.*` | Warm gray (slight green undertone) — text, borders, backgrounds |
| `color.success/warning/danger/info.*` | Semantic scales (50–900) |
| `fontSize.*` | Constrained type scale (xs through 4xl) |
| `fontFamily.sans` | Inter (via `next/font`) |
| `borderRadius.*` | sm=4px, md=6px, lg=8px, xl=12px |
| `boxShadow.*` | card, popover, modal — three elevations only |
| `transitionDuration.fast/base` | 150ms / 200ms |

shadcn components are overridden post-install to reference these token names rather than shadcn's default CSS variable names.

### D4: Font loading via `next/font`

Inter is loaded in `app/layout.tsx` using `next/font/google` with `subsets: ['latin']` and `variable: '--font-sans'`. The CSS variable is applied to `<html>` and referenced by the `fontFamily.sans` token. No external font request at runtime; Next.js inlines the subset at build time.

### D5: Layout shell structure

```
app/layout.tsx                    ← root layout; adds ThemeProvider, Toaster, font var
  └─ components/layout/Shell.tsx  ← top nav + sidebar scaffold + content area
       ├─ components/layout/TopNav.tsx
       ├─ components/layout/Sidebar.tsx   (responsive; collapsed mobile, persistent desktop)
       └─ {children}              ← page content rendered here
```

`Shell` is a server component. `Sidebar` and `TopNav` are server components with a client-side toggle for mobile collapse. The nav slot in `TopNav` accepts children — empty for now, populated by role-aware navigation in a future proposal.

### D6: `/design` route

`app/design/page.tsx` is a server component that imports and renders every primitive from `/web/components/ui/` with all documented variants. It also renders the full typography scale. No auth required (dev/internal). It renders under the layout shell.

### D7: Component token override approach

After `shadcn add <component>`, each component file in `/web/components/ui/` references shadcn's default CSS variables (e.g., `bg-primary`, `text-primary-foreground`). These map to shadcn's `hsl(var(--primary))` convention.

**Override approach:** in `globals.css`, map shadcn's expected CSS variables to our token values:
```css
:root {
  --primary: <our fairway green HSL values>;
  --primary-foreground: <white or near-white>;
  /* ... etc for each shadcn semantic variable */
}
```
This means shadcn components consume our palette without modifying the component files themselves. Changing our token values in `globals.css` cascades through all components.

## Risks / Trade-offs

- **Tailwind v4 API instability** → Verify exact version before starting. If v4 has breaking changes from any pre-release, fall back to v3 and document it.
- **shadcn/ui compatibility with Tailwind v4** → shadcn v3+ supports Tailwind v4; shadcn v2 targets Tailwind v3. Match versions. The `shadcn init` wizard will detect the Tailwind version.
- **Existing pages wrapped in shell may shift** → Pages currently render with no chrome. After wrapping, they'll have top nav and padding. This is expected but verify no functional elements (e.g., the golfer selector on `/dev/login`) are cut off or visually broken.
- **`next/font` in Docker standalone build** → Font files must be available at build time. The standalone output bundles them; verify the Docker build doesn't fail on font fetch.

## Open Questions

1. **Tailwind v4 vs v3 at implementation time:** Check `npm info tailwindcss version` before task 1. If v4 is stable, use the CSS-first config. If v3, use the JS config. Note the choice in a comment in the config file.
2. **Logo placeholder:** The top nav has a slot. Ship a text wordmark ("Golf League") for now.
