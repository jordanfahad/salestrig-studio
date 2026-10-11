# Project thread: Salestrig Studio

## Goal
Salestrig Studio is a Salestrig-branded social scheduling SaaS forked from Postiz v1.47.0 (AGPL-3.0, see `NOTICE`). In production with real users. Current focus: LinkedIn automation built on LinkedIn's official API.

## Current stage
Agent bus set up 2026-10-12. SS-001 (draft): audit the LinkedIn providers and orchestrator, and plan the LinkedIn automation.

## Decisions (dated)
- 2026-10-12: Work is split Claude (spec, review) / Astra (build) / Fahad (moves work, approves, pushes). Contract in `AGENT-BUS.md`.
- 2026-10-12: LinkedIn features use the official API and OAuth only. No scraping, no headless control of linkedin.com, no automatic connection requests or messages.

## Do-not-regress rules
- pnpm only. Lint from the repo root only.
- Backend layers: Controller > Service > Repository (or Controller > Manager > Service > Repository). Server logic in `libraries/nestjs-libraries`.
- Background jobs: Temporal workflows and activities in `apps/orchestrator`.
- Frontend: Tailwind 3; read `colors.scss`, `global.scss`, `tailwind.config.js` first; no `--color-custom*`; every SWR call in its own hook with `useFetch`; never disable react-hooks/rules-of-hooks; no new UI packages from npm.
- Schema changes need a migration plan and must not break existing users.
- Provider tokens stay in the existing encrypted integration storage.
- LinkedIn personal provider requests only `openid`, `profile`, `w_member_social` today. Do not re-add the legacy `r_basicprofile` scope (see comments in `linkedin.provider.ts`).
- Tests: `pnpm test:salestrig` (`jest.salestrig.config.cjs`, files named `*.salestrig.spec.ts`).

## Open problems
- Which LinkedIn automation features Fahad wants first: to be settled when reviewing the SS-001 plan.
- LinkedIn app review and product access (e.g. Community Management API) has weeks of lead time; the SS-001 plan must say which features need it.
