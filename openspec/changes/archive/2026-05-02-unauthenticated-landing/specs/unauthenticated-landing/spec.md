## ADDED Requirements

### Requirement: App identity on landing page
The `/login` page SHALL display the application name ("Golf League") and a brief tagline describing the app's purpose (golf league management).

#### Scenario: App name and tagline are visible
- **WHEN** an unauthenticated user visits `/login`
- **THEN** the page displays the text "Golf League" as the primary heading and a supporting tagline

### Requirement: Styled sign-in call-to-action
The `/login` page SHALL render a visually prominent sign-in button using the primary design token color, replacing the unstyled anchor link.

#### Scenario: Sign-in button uses primary styling
- **WHEN** an unauthenticated user views the `/login` page
- **THEN** a Button component with primary styling is displayed as the sign-in call-to-action

#### Scenario: Sign-in button navigates to Auth0 login
- **WHEN** an unauthenticated user clicks the sign-in button
- **THEN** they are navigated to `/auth/login` to begin the Auth0 authentication flow

### Requirement: Card-based layout
The `/login` page content SHALL be presented in a Card component, centered within the content area.

#### Scenario: Content is contained in a Card
- **WHEN** the `/login` page is rendered
- **THEN** the app identity and sign-in CTA are visually grouped inside a Card component using the existing design system
