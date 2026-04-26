## ADDED Requirements

### Requirement: Design tokens
The system SHALL define all visual design decisions as tokens in a single source-of-truth configuration. Components SHALL reference tokens; they SHALL NOT reference raw color values, font sizes, spacing values, radii, or shadow values directly.

#### Scenario: Token change propagates everywhere
- **WHEN** a token value (e.g. the primary color) is changed in the configuration
- **THEN** every component and page that uses that token reflects the change without any component-level edits

### Requirement: Color palette
The token set SHALL include a primary accent (fairway green), a secondary accent (warm sand/khaki), warm-gray neutrals, and semantic scales for success, warning, danger, and info. Each scale SHALL include at least a 50–900 range.

#### Scenario: Primary action uses primary token
- **WHEN** a Button with variant="default" is rendered
- **THEN** its background uses the primary accent token, not a hardcoded color value

### Requirement: Typography scale
The system SHALL define a constrained type scale (xs through 4xl) using Inter as the UI font, loaded via next/font with no runtime external request. A Typography component set (H1–H4, Lead, Body, Muted, Code) SHALL lock typographic decisions in one place.

#### Scenario: Heading uses typography component
- **WHEN** a page renders an H1
- **THEN** it uses the H1 typography component, which applies the correct font size, weight, and line height from the token scale

### Requirement: shadcn/ui primitive library
The system SHALL include an owned copy of a curated set of shadcn/ui primitives installed under `/web/components/ui/`. Primitives included: Button, Input, Label, Select, Checkbox, Dialog, Dropdown Menu, Toast, Card, Table, Tabs, Badge, Avatar, Separator, Skeleton, Form. All primitives SHALL consume design tokens rather than shadcn default values.

#### Scenario: Primitive uses our tokens
- **WHEN** any shadcn primitive is rendered
- **THEN** it uses our color tokens (mapped via CSS custom properties in globals.css), not shadcn's default palette

### Requirement: App layout shell
The system SHALL provide a layout shell wrapping all pages, consisting of: a top navigation bar, a responsive sidebar scaffold (collapsed on mobile, persistent on desktop), and a content area with consistent padding and max-width. The top navigation SHALL include a slot for role-aware navigation links (empty at this stage).

#### Scenario: Layout shell wraps all pages
- **WHEN** any page route is rendered
- **THEN** it is wrapped by the layout shell including top nav and sidebar scaffold

#### Scenario: Sidebar collapses on mobile
- **WHEN** the viewport is below the mobile breakpoint
- **THEN** the sidebar is collapsed/hidden and a toggle control is available

#### Scenario: Existing pages unaffected functionally
- **WHEN** the layout shell is applied to existing pages (/, /dev/login, /me)
- **THEN** all existing functionality continues to work; only surrounding chrome is added

### Requirement: Theme provider
The system SHALL wire next-themes as the theme provider at the layout level, with light mode as the only active mode at MVP. The structure SHALL allow dark mode to be enabled later by adding token overrides without refactoring component code.

#### Scenario: Light mode is default
- **WHEN** the app loads
- **THEN** light mode is applied

### Requirement: Toast notifications
The system SHALL expose a toast notification system via a Toaster component wired at the layout level. All toast notifications in the app SHALL go through this single provider.

#### Scenario: Toast renders at layout level
- **WHEN** any page triggers a toast notification
- **THEN** the toast renders consistently regardless of which page triggered it

### Requirement: Design catalogue route
The system SHALL provide a `/design` route listing every primitive from the component library with all documented variants, and every typography style. The route SHALL be visible under the layout shell.

#### Scenario: All primitives visible in catalogue
- **WHEN** a developer navigates to /design
- **THEN** every installed shadcn primitive and every typography component is rendered with its documented variants

### Requirement: Design system documentation
The system SHALL provide `/web/docs/design-system.md` documenting: the token names and their intent, the component inventory, how to add a new component, and the rule that components consume tokens (not raw values).

#### Scenario: Documentation is complete
- **WHEN** a new developer reads /web/docs/design-system.md
- **THEN** they can identify which token to use for any visual decision and understand how to add a new component following the established pattern
