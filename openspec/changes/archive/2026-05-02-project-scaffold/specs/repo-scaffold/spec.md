## ADDED Requirements

### Requirement: Single-command local startup
The repository SHALL be fully runnable from a fresh clone with `docker compose up -d` as the only required command, assuming Docker is installed.

#### Scenario: Fresh clone startup
- **WHEN** a developer runs `docker compose up -d` on a fresh clone with Docker installed
- **THEN** the postgres, api, and web services all reach a healthy/running state without error

#### Scenario: No manual pre-steps required
- **WHEN** a developer has only cloned the repo and copied `.env.example` to `.env`
- **THEN** no additional CLI commands, installs, or configuration steps are needed before `docker compose up -d`

### Requirement: Service dependency ordering
The `api` service SHALL not start until the `postgres` service is healthy. The `web` service SHALL not start until the `api` service is healthy.

#### Scenario: Postgres not yet ready
- **WHEN** `docker compose up -d` is run and postgres has not yet accepted connections
- **THEN** the api container waits and does not begin startup until postgres is healthy

#### Scenario: API not yet ready
- **WHEN** the api container is starting
- **THEN** the web container waits and does not begin startup until the api healthcheck passes

### Requirement: Environment variable contract documented
The repository SHALL include a `.env.example` file at the root that documents every environment variable required by any service.

#### Scenario: Developer onboarding
- **WHEN** a developer inspects `.env.example`
- **THEN** they can identify every required variable, its purpose, and an example or default value

### Requirement: `.env` excluded from version control
The `.env` file SHALL be listed in `.gitignore` and SHALL NOT be committed to the repository.

#### Scenario: Git status after setup
- **WHEN** a developer creates a `.env` from `.env.example`
- **THEN** `git status` does not show `.env` as a tracked or untracked file to commit
