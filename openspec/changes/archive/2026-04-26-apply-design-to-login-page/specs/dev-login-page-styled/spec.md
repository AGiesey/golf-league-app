## ADDED Requirements

### Requirement: Dev login page uses design system components
The `/dev/login` page SHALL render all UI using design system primitives (Card, Button, Avatar, Typography) and SHALL NOT use raw unstyled HTML elements for its visible output.

#### Scenario: Page renders with design system card layout
- **WHEN** a developer navigates to `/dev/login`
- **THEN** the page displays a centered Card containing a heading, a lead line, and the golfer list

#### Scenario: Page heading uses typography components
- **WHEN** the `/dev/login` page renders
- **THEN** the page title is rendered with the H1 typography component and a supporting Lead or Muted line — not a raw `<h1>` or `<p>` tag

### Requirement: Golfer selection uses Button primitive
Each golfer in the list SHALL be rendered as a full-width `Button` (variant="outline") using the design system Button primitive, not a raw `<button>` element.

#### Scenario: Each golfer shown as an outlined button
- **WHEN** the golfer list renders
- **THEN** each golfer appears as a full-width outlined Button containing the golfer's name and email

#### Scenario: Clicking a golfer button still sets cookie and redirects
- **WHEN** a developer clicks a golfer button
- **THEN** the `mock-golfer-id` cookie is set and the developer is redirected to `/me` (functional behavior unchanged)

### Requirement: Golfer list items include Avatar initials
Each golfer button SHALL include an Avatar showing the golfer's first and last initial to the left of their name.

#### Scenario: Avatar renders with correct initials
- **WHEN** a golfer named "Alice Anderson" appears in the list
- **THEN** an Avatar with fallback text "AA" is rendered alongside the button text
