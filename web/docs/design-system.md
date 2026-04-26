# Design System

The Golf League design system is token-driven. All visual decisions live in `app/globals.css`. Components consume tokens; they never reference raw values.

## The Rule

> **Components consume tokens. Never reference raw color, font-size, spacing, radius, or shadow values directly.**

Bad: `className="bg-[#1e6326]"`
Good: `className="bg-primary-600"` or via the `--primary` CSS variable.

---

## Token Reference

All tokens are defined in the `@theme` block in `app/globals.css`.

### Colors

| Token | Intent | Value |
|---|---|---|
| `--color-primary-{50–900}` | Fairway green — primary actions, active states | #f0f7f0 → #0c2d10 |
| `--color-primary-foreground` | Text on primary backgrounds | #ffffff |
| `--color-secondary-{50–900}` | Warm sand/khaki — secondary surfaces | #faf8f0 → #3a2d10 |
| `--color-neutral-{50–900}` | Warm gray — text, borders, backgrounds | #f8f9f8 → #1a1c1a |
| `--color-success-{50,500,700,900}` | Success semantic | green scale |
| `--color-warning-{50,500,700,900}` | Warning semantic | amber scale |
| `--color-danger-{50,500,700,900}` | Error / destructive semantic | red scale |
| `--color-info-{50,500,700,900}` | Informational semantic | blue scale |

### shadcn CSS Variable Mapping

shadcn components use CSS variables like `--primary`, `--muted`, etc. These are mapped to our tokens in `:root`:

| shadcn variable | Maps to |
|---|---|
| `--primary` | `var(--color-primary-600)` |
| `--primary-foreground` | `#ffffff` |
| `--secondary` | `var(--color-secondary-100)` |
| `--muted` | `var(--color-neutral-100)` |
| `--muted-foreground` | `var(--color-neutral-500)` |
| `--accent` | `var(--color-primary-50)` |
| `--accent-foreground` | `var(--color-primary-700)` |
| `--destructive` | `var(--color-danger-500)` |
| `--border` | `var(--color-neutral-200)` |
| `--input` | `var(--color-neutral-200)` |
| `--ring` | `var(--color-primary-500)` |

### Radius

| Token | Value |
|---|---|
| `--radius-sm` | 4px |
| `--radius-md` | 6px |
| `--radius-lg` | 8px |
| `--radius-xl` | 12px |

### Shadows (three elevations only)

| Token | Use for |
|---|---|
| `shadow-card` | Cards, content panels |
| `shadow-popover` | Dropdowns, tooltips, popovers |
| `shadow-modal` | Dialogs, modals |

### Motion

| Token | Value | Use for |
|---|---|---|
| `--transition-duration-fast` | 150ms | Hover states, micro-interactions |
| `--transition-duration-base` | 200ms | Panel open/close, focus transitions |

`prefers-reduced-motion` is respected globally — all animation is disabled for users who prefer it.

---

## Component Inventory

All components live in `web/components/`. shadcn primitives are in `web/components/ui/` — they're owned copies (not npm packages) so you can modify them if needed.

### Primitives (`components/ui/`)

| Component | Import | Key variants |
|---|---|---|
| Button | `@/components/ui/button` | `default`, `secondary`, `outline`, `ghost`, `destructive`, `link` · sizes: `sm`, `default`, `lg` |
| Input | `@/components/ui/input` | — |
| Label | `@/components/ui/label` | — |
| Select | `@/components/ui/select` | SelectTrigger, SelectContent, SelectItem |
| Checkbox | `@/components/ui/checkbox` | — |
| Dialog | `@/components/ui/dialog` | DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter |
| Dropdown Menu | `@/components/ui/dropdown-menu` | DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator |
| Toaster (Sonner) | `@/components/ui/sonner` | Wire in layout; call `toast()` from `sonner` |
| Card | `@/components/ui/card` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Table | `@/components/ui/table` | TableHeader, TableBody, TableRow, TableHead, TableCell |
| Tabs | `@/components/ui/tabs` | TabsList, TabsTrigger, TabsContent |
| Badge | `@/components/ui/badge` | `default`, `secondary`, `outline`, `destructive` |
| Avatar | `@/components/ui/avatar` | AvatarImage, AvatarFallback |
| Separator | `@/components/ui/separator` | — |
| Skeleton | `@/components/ui/skeleton` | — |
| Form | `@/components/ui/form` | Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage |

### Typography (`components/typography/`)

| Component | Use for |
|---|---|
| `H1` | Page titles |
| `H2` | Section headings |
| `H3` | Subsection headings |
| `H4` | Card titles, list group headers |
| `Lead` | Introductory paragraph below a page title |
| `Body` | Standard paragraph text |
| `Muted` | Helper text, secondary labels, captions |
| `Code` | Inline code snippets |

### Layout (`components/layout/`)

| Component | Role |
|---|---|
| `Shell` | Root layout wrapper — top nav + sidebar + content area |
| `TopNav` | Top navigation bar; accepts `navSlot` prop for role-aware links |
| `Sidebar` | Responsive sidebar; persistent on desktop, collapsible on mobile |

---

## How to Add a New Component

1. **Check if shadcn has it**: `npx shadcn@latest add <name>`. If yes, it installs to `components/ui/` and pulls in its dependencies.
2. **Verify token usage**: open the installed file and check that it uses `bg-primary`, `text-foreground`, `border-border`, etc. (shadcn variable names) — not raw values.
3. **Add it to the `/design` route**: import and render it with all variants in `app/design/page.tsx`.
4. **Update this doc**: add a row to the Component Inventory table.

If you're building a composite component (not a primitive):
- Put it in `components/` (not `components/ui/`)
- Use tokens from `globals.css` and primitives from `components/ui/`
- Never hardcode colors, sizes, or shadows

---

## Changing the Accent Color

1. Update `--color-primary-*` values in the `@theme` block in `app/globals.css`.
2. The `:root` mapping (`--primary: var(--color-primary-600)`) picks up the change automatically.
3. Every shadcn component and every page that uses `bg-primary`, `text-primary`, etc. reflects the change.
4. Verify at `/design` that the palette swatches and Button default variant look correct.
