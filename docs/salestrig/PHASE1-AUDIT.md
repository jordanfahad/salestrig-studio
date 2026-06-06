# Salestrig Studio — Phase 1 Audit & Execution Plan

> Working doc for the Salestrig Studio product, a Salestrig-branded social media
> scheduling SaaS derived from Postiz (AGPL-3.0). Forked from Postiz **v1.47.0**.
> See `NOTICE` for attribution and AGPL source-availability obligations.

## 1. Verified architecture map (checked against the cloned repo)

- **Monorepo:** pnpm workspaces (`pnpm@10.6.1`). Requires **Node 22.x** (`engines: >=22.12.0 <23.0.0`).
- **Apps** (`apps/`): `backend` (NestJS), `frontend` (Next.js 16 / React 19), `orchestrator`
  (**Temporal** worker — durable publishing workflows), `commands` (NestJS CLI/cron),
  `extension` (Chrome extension, cookie-based providers e.g. Skool), `sdk`.
- **Shared:** `libraries/nestjs-libraries` (database, integrations, services, dtos),
  plus other libs.
- **DB:** Prisma 6.5.0 + PostgreSQL. Schema:
  `libraries/nestjs-libraries/src/database/prisma/schema.prisma`.
  Key models: `Organization`, `User`, `UserOrganization` (team + `Role`), `Integration`
  (a connected channel; encrypted provider tokens), `Post`, `Comments`, `Media`,
  `Subscription`, `Customer`, `Credits`, `Webhooks`, `IntegrationsWebhooks`, `AutoPost`,
  `Sets`, `Signatures`, `Tags`, `Plugs`, `OAuthApp`/`OAuthAuthorization` (acts as an OAuth
  provider → "custom integrations"). Enums: `SubscriptionTier`, `Period`, `Provider`, `Role`.
- **AI:** multi-framework already present — `@ai-sdk/openai`, `mastra` (+ `mastra_*` tables),
  `@copilotkit/*`, `@langchain/*`. AI-provider abstraction (Claude/OpenAI/Gemini) builds on
  `ai-sdk`, which supports Anthropic via `@ai-sdk/anthropic`.
- **Queues/cache:** Redis (`ioredis`, `redis`), throttler-storage-redis.
- **Background jobs:** Temporal (`@temporalio/*`, `nestjs-temporal-core`) in `orchestrator`.
- **Email:** Resend (optional; if `RESEND_API_KEY` set, user activation required).
- **Storage:** Cloudflare R2 (S3 API) OR `STORAGE_PROVIDER=local`.
- **Billing:** Stripe (`stripe@20`, `@stripe/*`). `libraries/.../services/stripe.service.ts`,
  `.../subscriptions/{pricing.ts, subscription.service.ts, subscription.repository.ts}`.
- **Social providers (36, all official OAuth/API):**
  `libraries/nestjs-libraries/src/integrations/social/*.provider.ts` behind
  `social.integrations.interface.ts` — x, instagram(+standalone), facebook, linkedin(+page),
  tiktok, youtube, threads, pinterest, bluesky, mastodon(+custom), reddit, telegram, discord,
  slack, wordpress, gmb, medium, devto, hashnode, nostr, farcaster, lemmy, mewe, vk, twitch,
  kick, dribbble, listmonk, skool, whop, moltbook, etc.
- **Infra (docker-compose.dev.yaml):** postgres:17, redis:7, pgadmin, redisinsight,
  temporal (1.28) + temporal-postgresql:16 + temporal-elasticsearch:7.17, temporal-ui.
- **Deploy:** `Dockerfile.dev`, `docker-compose.yaml`, `railway.toml`, `Jenkins`, `var/docker/*`.

## 2. Hosting decision (locked 2026-06-03)

Docker on a VPS, **keeping Temporal** (most faithful to upstream, easiest merges).
This is a SEPARATE always-on app from the Vercel/Supabase salestrig.com site — Postiz's
long-running NestJS server + Temporal worker cannot run on Vercel serverless.

## 3. AGPL-3.0 compliance checklist

- [x] Keep `LICENSE` (AGPL-3.0) unchanged.
- [x] Add `NOTICE` crediting Postiz/Gitroom + provenance + §13 statement.
- [ ] Preserve all upstream copyright headers (do NOT strip during rebrand).
- [ ] Publish modified source at a public repo; set the URL in `NOTICE`.
- [ ] Add an in-app "Source code" link (footer + settings) → that repo (§13 network use).
- [ ] Do NOT copy Postiz trademarks/logos/marketing copy/screenshots/hosted-brand assets.
- [ ] Salestrig-authored files carry Salestrig copyright but remain AGPL-3.0.

## 4. Pricing / entitlements change plan (Phase 2) — LOW-RISK approach

Tier names appear in **18 files** and in the Prisma `SubscriptionTier` enum
(`STANDARD / PRO / TEAM / ULTIMATE`). **Do NOT rename the enum values** (would force a data
migration through billing, permissions, Stripe, public API). Instead:

| Internal enum (keep) | Salestrig plan | Monthly | Annual | channels | posts/mo | AI images | AI videos | team |
|---|---|---|---|---|---|---|---|---|
| STANDARD | **Starter** | $15 | $150 | 5 | 400 | 20* | 3 | no |
| TEAM | **Studio** | $20 | $200 | 10 | unlimited | 100 | 10 | yes |
| PRO | **Growth** (recommended) | $25 | $250 | 30 | unlimited | 300 | 30 | yes |
| ULTIMATE | **Agency** | $49 | $490 | 100 | unlimited | 500 | 60 | yes |

\* Starter AI-image count: confirm with product (spec lists AI copilot + 3 videos; images TBD).

Changes:
1. Rewrite the numbers in `subscriptions/pricing.ts` (single source of entitlement values).
2. Add a **display-label map** (enum → Salestrig name + marketing copy) in the frontend
   billing components — keeps enum stable, changes only presentation.
3. Create 8 Stripe prices (4 monthly + 4 annual) and map enum→priceId in config/env.
4. Enforce quotas server-side in NestJS (channel-connect, post-create, AI-generate,
   team-invite). Add usage dashboards + graceful upgrade prompts at each limit.
5. Tests for entitlement resolution + quota enforcement.

## 5. Net-new Salestrig feature modules (Phase 4)

Brand Voice Kit · Content Pillars (+ calendar distribution view) · Launch Campaign Planner
(7/14/30-day) · Repurposing Studio · Founder/Influencer template library · Plain-English
Analytics · Assistant/VA approval workflow (Idea→Draft→Needs Review→Approved→Scheduled→
Published) · Content Confidence Score · AI provider abstraction · CRM source-metadata seam.
Each = Prisma model + NestJS module + frontend page, entitlement-gated, AI-abstracted.

## 6. Rebrand surface (Phase 1/3)

README, logo/favicon/OG, all "Postiz" strings, email templates, color tokens, fonts, and the
15 UI surfaces (landing, pricing, auth, onboarding, dashboard, calendar, composer, AI copilot,
brand voice, pillars, analytics, team/approval, billing/settings, integrations, empty/error).

## 7. Local boot prerequisites (blocker on the current Windows machine)

- Node **22.x** (machine has 24.16 — incompatible) → install via nvm-windows/volta/winget.
- pnpm 10.6.1 → `corepack enable pnpm` (corepack 0.35 present).
- Docker Desktop + WSL2 (neither installed; WSL2 needs admin + reboot) for
  postgres/redis/temporal/elasticsearch.
- Boot sequence: `pnpm install` → `pnpm dev:docker` (infra) → `pnpm prisma-db-push` →
  `pnpm dev`. App on `http://localhost:4200` (frontend), backend `:3000`.

## 8. Risk register

1. Ops weight (Temporal + ES + Redis) — mitigated by VPS hosting decision.
2. AGPL §13 source availability — tracked above.
3. Platform OAuth app review (Meta/TikTok/X/LinkedIn/YouTube) — weeks of lead time; start early.
4. Provider token encryption at rest — preserve existing mechanism.
5. Scheduler duplication / DST — keep idempotency keys + IANA timezones (verify in orchestrator).
6. Upstream drift — keep `upstream` remote; isolate Salestrig changes for clean merges.
7. Node 24 vs required 22 + native modules (bcrypt/canvas/sharp) — pin Node 22 in CI/dev.

## 9. Status log

- 2026-06-03: Repo cloned from Postiz v1.47.0. Audit verified against source. `NOTICE` +
  this doc added (AGPL attribution). No functional code changed yet. Local boot blocked on
  environment (Node 22 + Docker/WSL2). Awaiting runtime-environment decision before
  pricing/rebrand edits that require typecheck/boot validation.
