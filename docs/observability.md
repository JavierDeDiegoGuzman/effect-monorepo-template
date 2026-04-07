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

## Default endpoints

- Server OTLP base URL: `http://localhost:4318`
- Browser OTLP base URL: `http://localhost:4318`

The collector is configured with CORS for `http://localhost:5173` so the Vite app can export traces directly.

## Environment variables

### Server

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`
- `OTEL_SERVICE_VERSION`

Set `OTEL_EXPORTER_OTLP_ENDPOINT=off` to disable tracing.

### Webapp

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

## Expected trace shape

When creating a todo, you should see a trace similar to:

```text
todos.create
  http.client POST /todos
    http.server POST /todos
      Todos.create
```
