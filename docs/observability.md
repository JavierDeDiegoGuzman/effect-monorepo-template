# Observability

This workspace exports tracing data from both the browser app and the server using OTLP.

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

Tracing is explicit now.

- set `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` for the server
- set `VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` for the webapp
- set either value to `off` to disable tracing intentionally

The collector is configured with CORS for `http://localhost:5173` so the Vite app can export traces directly.

The Jaeger UI is available at:

```text
http://localhost:16686
```

## Environment variables

### Server

Required when tracing is enabled:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`
- `OTEL_SERVICE_VERSION`

Optional:

- `NODE_ENV` defaults to `development`

Set `OTEL_EXPORTER_OTLP_ENDPOINT=off` to disable tracing.

### Webapp

Required when tracing is enabled:

- `VITE_OTEL_EXPORTER_OTLP_ENDPOINT`
- `VITE_OTEL_SERVICE_NAME`
- `VITE_OTEL_SERVICE_VERSION`

Set `VITE_OTEL_EXPORTER_OTLP_ENDPOINT=off` to disable tracing.

## What is instrumented

### Webapp

- `todos.list`
- `todos.create`
- `todos.update`

### Server

- `Todos.list`
- `Todos.getById`
- `Todos.create`
- `Todos.update`

## What You Should See In Jaeger

After starting the stack and generating traffic in the app, the services list should include:

- `todo-server`
- `todo-webapp`

If you only see `jaeger-all-in-one`, your application spans are not reaching Jaeger yet.

## Useful Searches

### Client-side business spans

- service: `todo-webapp`
- operations:
  - `todos.list`
  - `todos.create`
  - `todos.update`

### Server-side business spans

- service: `todo-server`
- operations:
  - `Todos.list`
  - `Todos.create`
  - `Todos.update`
  - `Todos.getById`

### HTTP spans

- service: `todo-server`
- operations like:
  - `http.server GET`
  - `http.server POST`
  - `http.server PATCH`

## Expected trace shape

When creating a todo, you should see a trace similar to:

```text
todos.create
  http.client POST /todos
    http.server POST /todos
      Todos.create
```

Creating or updating a todo will usually also trigger a new `todos.list` trace afterwards because the UI refreshes the list through atom reactivity.

## Troubleshooting

### Jaeger only shows `jaeger-all-in-one`

Check this order:

1. `pnpm observability:up`
2. restart `pnpm dev`
3. generate traffic in the app
4. refresh Jaeger

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
