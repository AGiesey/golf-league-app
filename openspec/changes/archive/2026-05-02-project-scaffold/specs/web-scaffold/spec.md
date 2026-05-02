## ADDED Requirements

### Requirement: Frontend reachable in browser
The Next.js application SHALL be accessible at `http://localhost:3000` when running via Docker Compose.

#### Scenario: Browser access after startup
- **WHEN** `docker compose up -d` completes and all services are healthy
- **THEN** navigating to `http://localhost:3000` returns the application without error

### Requirement: API base URL configured via environment variable
The frontend SHALL read the API base URL from the `NEXT_PUBLIC_API_URL` environment variable and use it for all API calls.

#### Scenario: API URL injected at build/runtime
- **WHEN** `NEXT_PUBLIC_API_URL` is set in the environment
- **THEN** the API client utility uses that value as the base URL for all requests

#### Scenario: Missing API URL
- **WHEN** `NEXT_PUBLIC_API_URL` is not set
- **THEN** the application surfaces a clear error or falls back to a documented default (e.g. `http://localhost:5000`)

### Requirement: Typed API client utility
The frontend SHALL provide a `lib/api.ts` module exporting a typed fetch wrapper (`apiFetch`) that all future features use for API communication.

#### Scenario: Successful API call
- **WHEN** `apiFetch` is called with a path and expected response type
- **THEN** it returns the parsed response typed as the specified type

#### Scenario: Non-2xx API response
- **WHEN** the API returns a non-2xx status
- **THEN** `apiFetch` throws an error with the status code and response body available
