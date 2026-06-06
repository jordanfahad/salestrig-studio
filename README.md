<h1 align="center">Salestrig Studio</h1>

<p align="center">
  <strong>Plan, create, schedule, and grow your social presence from one elegant AI-powered workspace.</strong>
</p>

<p align="center">
  <a href="https://opensource.org/license/agpl-v3">
    <img src="https://img.shields.io/badge/License-AGPL%203.0-blue.svg" alt="License: AGPL-3.0">
  </a>
</p>

---

Salestrig Studio is the social media command center for women-led businesses and
creator-driven brands — helping founders, creators, coaches, and consultants plan,
generate, schedule, repurpose, and analyze content across platforms with less stress
and more confidence.

It is part of the [Salestrig](https://salestrig.com) ecosystem.

## Built on Postiz (open source)

Salestrig Studio is built on, and derived from, the open-source
**[Postiz](https://github.com/gitroomhq/postiz-app)** project by Gitroom, forked from
Postiz **v1.47.0**. We are grateful to the Postiz maintainers and community.

This project is **not affiliated with, endorsed by, or sponsored by** Gitroom or the
Postiz project. "Postiz" is the property of its respective owners and is referenced
here only as factual attribution of provenance. See [`NOTICE`](./NOTICE) for details.

## License & source availability (AGPL-3.0)

This software is licensed under the **GNU AGPL-3.0** (see [`LICENSE`](./LICENSE)).
Because it may be operated as a hosted network service, AGPL-3.0 §13 requires that the
complete corresponding modified source code be made available to users of that service.
The corresponding source for the running Salestrig Studio service is published at the
repository linked in [`NOTICE`](./NOTICE). All upstream copyright notices are preserved.

## Tech stack

- **Monorepo:** pnpm workspaces · **Node 22.x**
- **Frontend:** Next.js / React · **Backend:** NestJS
- **Database:** PostgreSQL via Prisma · **Cache/queues:** Redis
- **Background jobs:** Temporal (durable publishing workflows) · **Email:** Resend
- **Apps:** `apps/{backend,frontend,orchestrator,commands,extension,sdk}`

## Local development (quickstart)

Prerequisites: **Node 22.x**, **pnpm 10.6.1** (via corepack), and **Docker**.

```bash
pnpm install                # install deps + generate Prisma client
pnpm dev:docker             # start postgres, redis, temporal (+ elasticsearch)
pnpm prisma-db-push         # sync the schema to the database
pnpm dev:backend            # backend (:3000) + frontend (:4200)
```

- Frontend: http://localhost:4200 · Backend: http://localhost:3000
- Temporal UI: http://localhost:8080 · pgAdmin: http://localhost:8081

> **Windows note:** use `start-dev.ps1`. The backend is started without
> `nest --watch` (it compiles but does not bind in watch mode on Windows), and the
> Chrome `extension` app is skipped (its dev script is not Windows-portable).

See [`docs/salestrig/PHASE1-AUDIT.md`](./docs/salestrig/PHASE1-AUDIT.md) for the
architecture map and the project roadmap.

## Contributing & conduct

Upstream contribution and conduct documents are retained in this repository
(`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CCLA.md`, `ICLA.md`). Salestrig-specific
contribution guidelines will be added as the project matures.
