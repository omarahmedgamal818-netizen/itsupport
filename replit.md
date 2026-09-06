# IT Support AI Assistant

An internal IT support workspace that guides employees through safe troubleshooting and turns unresolved issues into service tickets.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ai-support-assistant/src/App.tsx` — employee guided support flow and service desk UI
- `artifacts/api-server/src/routes/support.ts` — troubleshooting and ticket API routes
- `lib/api-spec/openapi.yaml` — source of truth for support and ticket contracts
- `lib/db/src/schema/tickets.ts` — support ticket persistence schema

## Architecture decisions

- The employee flow keeps troubleshooting state visible and only shares context when the employee creates a ticket.
- Troubleshooting sessions are intentionally lightweight and stateful in the API process; tickets are persisted in PostgreSQL.
- The UI uses the generated API client hooks so ticket updates invalidate the queue and overview data.

## Product

Employees can describe an issue in plain language, run guided connectivity checks, and hand off unresolved issues with context attached. Support teams can filter, inspect, assign, and update the status or priority of incoming tickets.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
