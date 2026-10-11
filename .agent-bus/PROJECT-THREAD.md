# Project thread: Salestrig Studio

## Goal
Salestrig Studio is a Salestrig-branded social scheduling SaaS forked from Postiz v1.47.0 (AGPL-3.0, see `NOTICE`). In production with real users. Current focus: LinkedIn automation built on LinkedIn's official API.

## Current stage
SS-001 and SS-002 merged. Next: SS-003 (credential and reconnect fixes from SS-001 4.3), not yet written.

## Decisions (dated)
- 2026-10-12: Work is split Claude (spec, review) / Astra (build) / Fahad (moves work, approves, pushes). Contract in `AGENT-BUS.md`.
- 2026-10-12: LinkedIn features use the official API and OAuth only. No scraping, no headless control of linkedin.com, no automatic connection requests or messages.

- 2026-10-12: SS-001 reviewed and merged. Claims spot-checked against code: video uploader uses only the first upload URL and an empty uploadToken; "resource is forbidden" is retried; token fan-out `updateMany` filters on rootInternalId without organizationId; reconnect stores `body.refresh` as refreshToken; integration tokens are stored without application-level encryption. Build order: SS-002 video upload fix, then SS-003 small credential/reconnect fixes, then the remaining slices from `outbox/SS-001.md` 4.6.
- 2026-10-12: SS-002 reviewed and merged. Video upload now validates LinkedIn upload instructions, PUTs each inclusive range to its own URL, requires ETags, and finalises with the real uploadToken. Claude re-ran checks on Linux, Node 22: `pnpm test:salestrig` 57/57 pass (after `prisma generate`), `build:backend` and `build:orchestrator` pass. ESLint cannot load the repo config at all (pre-existing, unrelated).

## Do-not-regress rules
- pnpm only. Lint from the repo root only.
- Backend layers: Controller > Service > Repository (or Controller > Manager > Service > Repository). Server logic in `libraries/nestjs-libraries`.
- Background jobs: Temporal workflows and activities in `apps/orchestrator`.
- Frontend: Tailwind 3; read `colors.scss`, `global.scss`, `tailwind.config.js` first; no `--color-custom*`; every SWR call in its own hook with `useFetch`; never disable react-hooks/rules-of-hooks; no new UI packages from npm.
- Schema changes need a migration plan and must not break existing users.
- Provider tokens: SS-001 found no application-level encryption on the integration token path. Never log tokens, never add new places that persist or serialise them, and treat encryption at rest as planned work (SS-001 slice 2), not an existing guarantee.
- LinkedIn personal provider requests only `openid`, `profile`, `w_member_social` today. Do not re-add the legacy `r_basicprofile` scope (see comments in `linkedin.provider.ts`).
- Tests: `pnpm test:salestrig` (`jest.salestrig.config.cjs`, files named `*.salestrig.spec.ts`).

## Open problems
- ESLint config fails to load repo-wide (`@eslint/eslintrc` schema error). Lint is currently not a usable gate.
- On Fahad's PC the Codex sandbox does not start, so every command needs manual approval.
- Token encryption at rest, tenant scoping of token fan-out, credential-bearing payloads in Temporal history and Errors.body (SS-001 4.3).
- Which LinkedIn products are approved on the app (Community Management API tier, member analytics, feed scopes). Owner to supply names only.
- Which LinkedIn automation features Fahad wants first: to be settled when reviewing the SS-001 plan.
- LinkedIn app review and product access (e.g. Community Management API) has weeks of lead time; the SS-001 plan must say which features need it.
