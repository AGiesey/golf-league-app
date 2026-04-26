## Why

The app has working pages but no shared visual language. Every new UI proposal will either invent its own styling (drift) or stall waiting for ad-hoc design decisions. Establishing a design system foundation now — before more pages are built — pays off on every future UI proposal.

## What Changes

### Adds

- **Design tokens** in Tailwind config: color scale (fairway green primary, sand secondary, warm-gray neutrals, semantic scales), typography scale, spacing, radii, shadows, motion. Tokens are the single source of truth — components reference tokens, never raw values.
- **shadcn/ui setup** in `/web` with a curated primitive set: Button, Input, Label, Select, Checkbox, Dialog, Dropdown Menu, Toast, Card, Table, Tabs, Badge, Avatar, Separator, Skeleton, Form.
- **App layout shell**: top navigation, page container, responsive sidebar scaffold (collapsed on mobile, persistent on desktop), content area with consistent padding and max-width. Includes a role-aware navigation slot (no role logic yet).
- **Typography component set**: `H1`–`H4`, `Lead`, `Body`, `Muted`, `Code` wrappers that lock typographic decisions in one place.
- **Theme provider** via `next-themes`, wired for light mode at MVP with structure to add dark mode later without component refactoring.
- **Toast provider** wired at the layout level.
- **`/design` route** listing every primitive with its variants and every typography style — the internal component catalogue.
- **`/web/docs/design-system.md`**: token reference, component inventory, how to add a new component, and the token-only rule.

### Does not change

- No existing page is restyled. Pages keep working exactly as they do today.
- No backend changes. This is `/web`-only.
- No data model changes.

## Capabilities

### New Capabilities

- `design-system`: Design tokens, shadcn/ui primitives, layout shell, typography components, theme provider, and the `/design` catalogue route.

### Modified Capabilities

<!-- none -->

## Impact

- Adds dependencies to `/web`: `tailwindcss`, `shadcn/ui` scaffolding, `lucide-react`, `class-variance-authority`, `tailwind-merge`, `clsx`, `next-themes`, `react-hook-form`, `@hookform/resolvers`, `zod`.
- Adds `/web/components/ui/` (owned copies of shadcn primitives) and `/web/components/layout/`.
- Adds `/web/app/design/` route (dev/internal only).
- Wraps all existing pages in the new layout shell — no content or behavior changes, only surrounding chrome.
- Tailwind config becomes the single source of visual truth; changing a token changes all components.
