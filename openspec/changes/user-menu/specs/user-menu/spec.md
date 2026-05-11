## ADDED Requirements

### Requirement: UserMenu composite component
The system SHALL provide a `UserMenu` composite component at `web/components/user-menu.tsx`. It SHALL accept `golferName: string` and `isCommissioner: boolean` as props. When `golferName` is an empty string, the component SHALL render nothing.

#### Scenario: Renders nothing for unregistered user
- **WHEN** `golferName` is an empty string
- **THEN** `UserMenu` renders null (no element is present in the DOM)

#### Scenario: Renders avatar trigger for registered user
- **WHEN** `golferName` is a non-empty string
- **THEN** a button trigger is present in the header containing an avatar with the golfer's initials

### Requirement: Avatar initials fallback
The `UserMenu` trigger SHALL display an avatar with the golfer's initials derived from `golferName`. Initials SHALL be the first character of the first word and the first character of the last word, both uppercased. The avatar SHALL use `bg-muted` background and `text-muted-foreground` foreground tokens.

#### Scenario: Two-word name produces two initials
- **WHEN** `golferName` is "Adam Giesey"
- **THEN** the avatar fallback displays "AG"

#### Scenario: Single-word name produces one initial
- **WHEN** `golferName` is "Cher"
- **THEN** the avatar fallback displays "C"

#### Scenario: Avatar uses muted token colors
- **WHEN** `UserMenu` renders
- **THEN** the avatar background is `bg-muted` and the text is `text-muted-foreground` — no raw color values

### Requirement: Name visible in trigger at sm+ breakpoints
At viewport widths `sm` and above (≥ 640px), the trigger SHALL display the golfer's first name inline next to the avatar. At widths below `sm`, only the avatar SHALL be visible; the name SHALL be hidden via `hidden sm:inline`.

#### Scenario: First name shown at desktop width
- **WHEN** viewport width is ≥ 640px
- **THEN** the golfer's first name is visible in the trigger next to the avatar

#### Scenario: Name hidden at mobile width
- **WHEN** viewport width is < 640px
- **THEN** only the avatar is visible in the trigger; no name text is rendered

### Requirement: Accessible trigger
The trigger button SHALL have an `aria-label` of `"Account menu for [golfer name]"`. The `AvatarFallback` SHALL be `aria-hidden="true"` since the button's label already describes the action.

#### Scenario: Trigger has descriptive aria-label
- **WHEN** `golferName` is "Adam Giesey"
- **THEN** the trigger button has `aria-label="Account menu for Adam Giesey"`

#### Scenario: Avatar fallback is aria-hidden
- **WHEN** `UserMenu` renders
- **THEN** the `AvatarFallback` element has `aria-hidden="true"`

### Requirement: Dropdown opens on trigger activation
Clicking or pressing Enter/Space on the trigger SHALL open a dropdown menu. The `DropdownMenu` primitive SHALL handle keyboard navigation (arrow keys, Escape to close, Tab to move focus out).

#### Scenario: Dropdown opens on click
- **WHEN** the user clicks the trigger
- **THEN** the dropdown opens

#### Scenario: Dropdown closes on Escape
- **WHEN** the dropdown is open and the user presses Escape
- **THEN** the dropdown closes and focus returns to the trigger

### Requirement: Dropdown header with full name and optional commissioner badge
The top of the dropdown SHALL display the golfer's full name. When `isCommissioner` is true, a "Commissioner" badge SHALL appear next to the name. The badge SHALL use the `secondary` variant from the `Badge` primitive. When `isCommissioner` is false, no badge is rendered.

#### Scenario: Commissioner sees badge in dropdown header
- **WHEN** `isCommissioner` is true and the dropdown is open
- **THEN** the dropdown header shows the full golfer name and a "Commissioner" badge

#### Scenario: Regular golfer sees no badge
- **WHEN** `isCommissioner` is false and the dropdown is open
- **THEN** the dropdown header shows only the full golfer name with no badge

### Requirement: My Profile menu item
The dropdown SHALL contain a "My Profile" item that navigates to `/me`. It SHALL be rendered as a `DropdownMenuItem` above the final separator.

#### Scenario: My Profile item navigates to /me
- **WHEN** the dropdown is open and the user activates "My Profile"
- **THEN** the browser navigates to `/me`

### Requirement: Log out menu item
The dropdown SHALL contain a "Log out" item anchored at the bottom of the menu (below a separator). It SHALL navigate to `/api/auth/logout`.

#### Scenario: Log out item navigates to logout endpoint
- **WHEN** the dropdown is open and the user activates "Log out"
- **THEN** the browser navigates to `/api/auth/logout`

### Requirement: Touch-friendly dropdown item heights
All dropdown items SHALL have a minimum touch target height of 44px to meet mobile usability standards.

#### Scenario: Items meet minimum touch target size
- **WHEN** the dropdown is open on a touch device
- **THEN** each interactive item has a minimum height of 44px

### Requirement: Dropdown positioned at top-right of header
The dropdown SHALL open anchored to the trigger in the `ml-auto` end of the header. It SHALL not obscure the primary nav area and SHALL be visually separated from the header by a `shadow-popover` elevation.

#### Scenario: Dropdown uses popover shadow
- **WHEN** the dropdown opens
- **THEN** it has the `shadow-popover` token applied (no raw shadow values)

### Requirement: UserMenu slot in TopNav
`TopNav` SHALL accept a `userMenuSlot?: React.ReactNode` prop. When provided, it SHALL render in the `ml-auto` end of the header, replacing the hardcoded logout link. When not provided, nothing renders in the right end of the header.

#### Scenario: userMenuSlot renders at right end of header
- **WHEN** `TopNav` receives a non-null `userMenuSlot`
- **THEN** the slot content appears at the right end of the header (`ml-auto` position)

#### Scenario: No hardcoded logout link remains
- **WHEN** `TopNav` renders (with or without `userMenuSlot`)
- **THEN** there is no hardcoded `<a href="/api/auth/logout">Log out</a>` element in the header

### Requirement: Shell passes golferName to UserMenu
`Shell` SHALL accept a `golferName: string` prop alongside `isCommissioner: boolean`. It SHALL render `<UserMenu golferName={golferName} isCommissioner={isCommissioner} />` and pass it as `userMenuSlot` to `TopNav`.

#### Scenario: Shell wires golferName into TopNav
- **WHEN** `Shell` renders with `golferName="Adam Giesey"` and `isCommissioner={false}`
- **THEN** `TopNav`'s `userMenuSlot` contains a `UserMenu` with those props

### Requirement: Dropdown extensibility
The dropdown menu structure SHALL place "My Profile" and other future utility items above a separator that precedes "Log out". Future items SHALL be insertable as additional `DropdownMenuItem` elements in this slot without restructuring the component.

#### Scenario: Log out is the last item in the dropdown
- **WHEN** the dropdown is open
- **THEN** "Log out" is the bottommost interactive item, preceded by a separator
