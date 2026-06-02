# Database and Migrations

The server uses Effect SQL for database access and `effect/unstable/sql/Migrator` for schema migrations.

## Runtime adapters

Canonical adapters:

- `memory`: fast domain tests and ephemeral demos, no SQL schema;
- `sqlite`: local development and programmatic e2e tests;
- `postgres`: production and prod-like runs.

SQL runtime setup lives in `packages/backend-infra/src/database`:

```txt
packages/backend-infra/src/database/
  Sqlite.ts              # SQLite client layer, migrations, optional demo seed
  Postgres.ts            # Postgres client layer and migrations
  cli.ts                 # explicit db:migrate/db:reset/db:seed command entrypoint
  migrations.ts          # migration registry and runner
  migrations/*.ts        # numbered schema migrations
  seed.ts                # demo seed data, separate from migrations
```

`packages/backend-infra` owns database config/connections, migrations, seed/CLI commands, SQL/Postgres repository adapters, SQL transaction support, password/token live services, and SQL test layers. Domain repository ports and in-memory test adapters live in `packages/backend-domain`; HTTP handlers and server runtime composition live in `apps/server`.

Repositories do not create or mutate schema. They assume the database layer has run migrations before repository layers are built.

## Commands

Root commands load `.env` before delegating to the `@app/backend-infra` package. If `SQLITE_FILENAME` is omitted, SQLite commands use `./.data/app.db` from the backend-infra working directory.

```bash
pnpm db:migrate          # run pending local SQLite migrations
pnpm db:reset            # remove the local SQLite db, -wal, and -shm files, then migrate
pnpm db:seed             # run migrations and insert demo rows when the DB is empty
pnpm dev:demo            # reset, seed, then start server + webapp
pnpm db:migrate:postgres # run pending Postgres migrations using DATABASE_URL
pnpm db:seed:postgres    # run Postgres migrations and seed when empty
```

There is intentionally no scripted Postgres reset. Destructive production or prod-like database resets should be explicit operational work, not a template convenience command.

The backend-infra package also exposes the same commands for direct package use:

```bash
pnpm --filter @app/backend-infra db:migrate
pnpm --filter @app/backend-infra db:reset
pnpm --filter @app/backend-infra db:seed
pnpm --filter @app/backend-infra db:migrate:postgres
pnpm --filter @app/backend-infra db:seed:postgres
```

When running backend-infra package commands directly, provide the required environment variables yourself or run through the root commands.

## Schema migrations

Schema changes are versioned Effects under `packages/backend-infra/src/database/migrations` and registered in `packages/backend-infra/src/database/migrations.ts`.

Current migration registry shape:

```ts
export const migrationEntries = [
  [1, "initial", Migration001Initial],
] as const
```

Migration keys become `effect_sql_migrations` rows such as `1_initial`. The migrator creates the tracking table and runs only pending migrations.

### Adding a migration

1. Add a numbered file, for example `packages/backend-infra/src/database/migrations/002_add_projects.ts`.
2. Export a default `Effect` that requires `SqlClient.SqlClient`.
3. Use `sql.onDialectOrElse` when SQLite and Postgres syntax differs.
4. Register the migration in `migrationEntries` with the next numeric ID.
5. Add or update SQL repository tests and migration tests when behavior or compatibility matters.
6. Update docs if the persistence model, local setup, or module relationship changes.

Example:

```ts
import { Effect } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  yield* sql.onDialectOrElse({
    pg: () => sql`ALTER TABLE todos ADD COLUMN due_at TIMESTAMPTZ`,
    orElse: () => sql`ALTER TABLE todos ADD COLUMN due_at TEXT`,
  })
})
```

Migrations should be forward-only and safe to run once. If a migration may be re-entered after a partial local/manual change, guard it with catalog checks such as `PRAGMA table_info(...)` for SQLite or the appropriate Postgres catalog query.

## Demo seed data

Demo data is intentionally separate from schema migrations in `packages/backend-infra/src/database/seed.ts`.

SQLite local development runs migrations and then seeds demo data by default. Tests opt into seeding explicitly through `makeTestSqliteLayer({ seed: true })`; the default test database is unseeded.

Do not put demo rows, fixtures, or backfills in schema migrations unless those rows are required reference data for every environment.

## Testing migrations

Migration tests live next to database infrastructure. The canonical pattern is:

1. create a temporary SQLite database with `makeTestSqliteLayer({ migrate: false })`;
2. call `runMigrations()` or `runMigrations({ toMigrationInclusive: n })`;
3. inspect schema/catalog/data through `SqlClient.SqlClient`;
4. verify idempotence or partial-migration compatibility when relevant.

The migrator records completed migrations in `effect_sql_migrations`. Tests can assert against that table for migration ordering and names.

## Data migrations

Use schema migrations for structural changes: tables, columns, indexes, constraints.

Use a separate data-migration service/table for long-running or resumable backfills once the template needs one. Data migrations should record completion by stable name and be safe to resume. Do not hide long-running data rewrites inside request handlers or repository methods.
