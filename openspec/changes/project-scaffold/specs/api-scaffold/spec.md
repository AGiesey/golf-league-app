## ADDED Requirements

### Requirement: Health endpoint
The API SHALL expose a `GET /health` endpoint that returns HTTP 200 when the service is running.

#### Scenario: Healthy API
- **WHEN** a client sends `GET /health`
- **THEN** the API responds with HTTP 200

### Requirement: Automatic database migration on startup
The API SHALL apply all pending EF Core migrations automatically during startup, before serving any requests.

#### Scenario: First startup with empty database
- **WHEN** the API container starts against a fresh postgres instance
- **THEN** all EF Core migrations are applied and the schema is up to date before the first request is served

#### Scenario: Startup with already-migrated database
- **WHEN** the API container starts against a database that is already at the latest migration
- **THEN** startup completes without error and no migration changes are made

### Requirement: CORS configuration
The API SHALL restrict cross-origin requests to origins listed in the `ALLOWED_ORIGINS` environment variable.

#### Scenario: Request from allowed origin
- **WHEN** an HTTP request arrives from an origin listed in `ALLOWED_ORIGINS`
- **THEN** the API includes the appropriate CORS response headers

#### Scenario: Request from disallowed origin
- **WHEN** an HTTP request arrives from an origin not in `ALLOWED_ORIGINS`
- **THEN** the API does not include CORS allow headers for that origin

### Requirement: Database connection via environment variable
The API SHALL read its PostgreSQL connection string from the `ConnectionStrings__Default` environment variable using EF Core's standard configuration binding.

#### Scenario: Valid connection string provided
- **WHEN** `ConnectionStrings__Default` is set to a valid PostgreSQL connection string
- **THEN** the API connects to that database on startup

#### Scenario: Missing connection string
- **WHEN** `ConnectionStrings__Default` is not set
- **THEN** the API fails to start with a clear configuration error
