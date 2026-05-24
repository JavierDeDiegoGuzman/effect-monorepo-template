# Observability

This workspace can export tracing data from both the browser app and the server using OTLP.

Tracing is disabled by default in `.env.example` with endpoint values set to `off`. In development, omitting the endpoint also disables tracing. In non-development environments, an endpoint is required when tracing should be active.

## Local stack

Start Jaeger and the OpenTelemetry Collector:

```bash
pnpm observability:up
```

Jaeger UI:

```text
http://localhost:16686
```

Stop the stack:

```bash
pnpm observability:down
```

## Endpoint configuration

To enable local tracing, set these values in the root `.env` file and restart `pnpm dev`:

```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=todo-server
OTEL_SERVICE_VERSION=0.1.0
VITE_OTEL_SERVICE_NAME=todo-webapp
VITE_OTEL_SERVICE_VERSION=0.1.0
```

Set either endpoint value to `off` to disable tracing intentionally for that app.

The collector is configured with CORS for `http://localhost:5173` so the Vite app can export traces directly.

## Environment variables

### Server

Required when server tracing is enabled:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`
- `OTEL_SERVICE_VERSION`

Optional:

- `NODE_ENV` defaults to `development`

### Webapp

Required when browser tracing is enabled:

- `VITE_OTEL_EXPORTER_OTLP_ENDPOINT`
- `VITE_OTEL_SERVICE_NAME`
- `VITE_OTEL_SERVICE_VERSION`

## What is instrumented

### Webapp

Current atom queries/actions create client spans for:

- `auth.me`, `auth.login`, `auth.register`, `auth.logout`
- `todos.list`, `todos.create`, `todos.update`

### Server

The server installs the Effect OTLP layer when tracing is enabled, so server-side spans emitted by the Effect HTTP/runtime stack are exported with the `todo-server` service resource.

Domain and repository operations add predictable Effect span names through `Effect.fn`, including:

- `Auth.register`, `Auth.login`, `Auth.verifySession`
- `Users.getById`, `Users.findByEmail`, `Users.create`
- `Todos.listByUser`, `Todos.getByIdForUser`, `Todos.createForUser`, `Todos.updateForUser`
- SQL repository operations such as `SqlUsersRepository.create` and `SqlTodosRepository.updateCompletedForUser`
- migration spans emitted by the Effect SQL migrator, named like `Migrator 1_initial`

Safe annotations include stable internal/public IDs, boolean flags, and input lengths such as `todo.title.length`. Raw emails, passwords, tokens, and todo titles are not emitted as span attributes.

## What You Should See In Jaeger

After enabling tracing, starting the stack, restarting `pnpm dev`, and generating traffic in the app, the services list should include:

- `todo-server`
- `todo-webapp`

If you only see `jaeger-all-in-one`, your application spans are not reaching Jaeger yet.

## Expected trace shape

When creating a todo, expect a `todos.create` client span, HTTP/server spans, `Todos.createForUser`, and a SQL repository span. Creating or updating a todo will usually also trigger a new list trace afterwards because the UI refreshes data through atom reactivity.

When repository failures reach the HTTP seam, `withHttpErrorMapping` logs a safe message containing only the repository name and operation before returning the public `InternalServerError` contract.

## Troubleshooting

### Jaeger only shows `jaeger-all-in-one`

Check this order:

1. `pnpm observability:up`
2. set both OTLP endpoint variables to `http://localhost:4318` in `.env`
3. restart `pnpm dev`
4. generate traffic in the app
5. refresh Jaeger

You can also verify by API:

```bash
curl -s "http://localhost:16686/api/services"
```

### Browser spans do not appear

Check that:

- `VITE_OTEL_EXPORTER_OTLP_ENDPOINT` points to `http://localhost:4318`
- the collector is running
- the browser app was reloaded after config changes

### Server spans do not appear

Check that:

- `OTEL_EXPORTER_OTLP_ENDPOINT` points to `http://localhost:4318`
- the server was restarted after config changes
- the server actually handled some requests
