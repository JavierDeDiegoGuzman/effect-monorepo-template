# Testing

## Current State

This template does not yet ship with a full integration test harness.

What it does ship with is the structure needed to build one in a clean way:

- a real HTTP server
- a typed CLI client
- a shared API contract

## Recommended Testing Philosophy

Prefer real HTTP integration tests over heavy mocking.

That means:

- start the server
- call it through the real HTTP boundary
- assert on real responses

This matches how the webapp and CLI use the system in practice.

## Role Of The CLI

The CLI in `apps/cli` is intended for two use cases:

1. debugging
2. smoke and integration testing

Because it uses the same shared API contract, it is a good automation surface for:

- CI smoke checks
- local debugging
- LLM-driven verification flows

## Suggested Next Step For This Template

Add a helper that starts the server on an ephemeral port, then run tests against it with either:

- a typed client
- the CLI

That would let you write tests like:

1. start test server
2. create a todo
3. list todos
4. update a todo
5. assert on the final state

## Why This Matters

This template is intended to make end-to-end verification simple.

The combination of shared API definitions and a real CLI makes it easier to avoid tests that drift away from actual runtime behavior.
