# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

DecisionMate is a full-stack AI-assisted daily decision-making web app. Users enter a decision problem with optional mood, time, priority, sleep, stress, and deadline context. The backend evaluates rule-based logic first, optionally enhances the recommendation with Gemini, stores the decision, and exposes history/dashboard data to the React frontend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Gemini via Replit AI integration
- **Frontend**: React + Vite, TanStack Query, Tailwind CSS

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/decisionmate run dev` — run DecisionMate frontend locally

## DecisionMate Structure

- `artifacts/decisionmate` — React frontend for the assistant, dashboard, and decision history
- `artifacts/api-server/src/routes/decisions.ts` — decision history, creation, deletion, and dashboard endpoints
- `artifacts/api-server/src/lib/decision-engine.ts` — rule-based decision engine and Gemini enhancement layer
- `lib/db/src/schema/decisions.ts` — persisted decision records
- `lib/integrations-gemini-ai` — Gemini client package using provisioned AI integration env vars
- `lib/api-spec/openapi.yaml` — API contract for generated frontend hooks and backend validation

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
