## MODIFIED Requirements

### Requirement: Sidebar navigation items
The sidebar SHALL render navigation links for Dashboard and a disabled placeholder for Scores/Rounds. All authenticated users see these items regardless of role. "My Profile" SHALL NOT appear in the sidebar; it has moved to the `UserMenu` dropdown in the header.

#### Scenario: Dashboard link present
- **WHEN** an authenticated user views any page in the app shell
- **THEN** the sidebar contains a link to `/dashboard` labelled "Dashboard"

#### Scenario: My Profile link absent from sidebar
- **WHEN** an authenticated user views any page in the app shell
- **THEN** the sidebar does NOT contain a link to `/me` or any item labelled "My Profile"

#### Scenario: Scores/Rounds placeholder present
- **WHEN** an authenticated user views any page in the app shell
- **THEN** the sidebar contains a non-interactive "Scores / Rounds" item in a muted style indicating it is not yet available
