# Salestrig Studio — Production deploy (AWS EC2 + Docker)

Salestrig Studio is a long-running app (NestJS + Temporal worker + Redis + Postgres
+ Elasticsearch). It can't run on serverless — it needs an always-on host. This
guide deploys it to a single AWS EC2 instance with Docker Compose, building the
image **from this repo's source** (so all Salestrig branding + features ship).

## 0. Why not the upstream compose
`docker-compose.yaml` pulls `ghcr.io/gitroomhq/postiz-app:latest` (vanilla Postiz).
**Use `docker-compose.salestrig.yaml`** instead — it builds the image from
`Dockerfile.dev` using our code.

## 1. Provision the EC2 instance
- **Type:** `t3.large` minimum (8 GB RAM) — Elasticsearch + Temporal + Postgres +
  Redis + the app need it; `t3.xlarge` (16 GB) is comfortable. ARM `t4g.large` also fine.
- **OS:** Ubuntu 22.04/24.04 LTS.
- **Disk:** 30+ GB gp3.
- **Security group (inbound):** 22 (SSH, your IP only), 80, 443. Keep 4007/8080/5432
  closed to the world (nginx/Caddy will front the app).
- Allocate an **Elastic IP** and point DNS at it (step 6).

## 2. Install Docker on the instance
```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # re-login after this
```

## 3. Get the code
Publish this repo to a **private** git remote (recommended) and clone it, or rsync it up.
```bash
git clone <your-salestrig-studio-repo> salestrig && cd salestrig
git checkout salestrig-studio
```
> AGPL §13: the corresponding source must be available to users of the hosted
> service. Set the in-app/footer "Source code" link to your public source repo and
> the URL placeholder in `NOTICE`.

## 4. Configure the environment
```bash
cp .env.example .env.production
```
Then edit `.env.production` and set:
- `JWT_SECRET` — long random string.
- `DATABASE_URL=postgresql://postiz-user:postiz-password@postiz-postgres:5432/postiz-db-local`
- `REDIS_URL=redis://postiz-redis:6379`
- `TEMPORAL_ADDRESS=temporal:7233`
- `MAIN_URL` / `FRONTEND_URL=https://studio.salestrig.com`
- `NEXT_PUBLIC_BACKEND_URL=https://studio.salestrig.com/api`
- `BACKEND_INTERNAL_URL=http://localhost:3000`
- `IS_GENERAL=true`, `STORAGE_PROVIDER=local`, `UPLOAD_DIRECTORY=/uploads`
- `OPENAI_API_KEY=` your key.
- **Stripe LIVE (production only):** `STRIPE_PUBLISHABLE_KEY=pk_live_…`,
  `STRIPE_SECRET_KEY=sk_live_…` (or restricted), `STRIPE_SIGNING_KEY=whsec_…` from a
  live webhook endpoint pointing at `https://studio.salestrig.com/api/stripe`.
- **Social OAuth** (once approved): `FACEBOOK_APP_ID/SECRET`, `TIKTOK_CLIENT_ID/SECRET`,
  `LINKEDIN_CLIENT_ID/SECRET`, etc. — redirect URIs use the `studio.salestrig.com` domain.

## 5. Build & run
```bash
docker compose -f docker-compose.salestrig.yaml up -d --build
docker compose -f docker-compose.salestrig.yaml logs -f salestrig   # watch boot
```
First build takes a while (compiles the monorepo). The app listens on `4007`.

## 6. TLS + domain (studio.salestrig.com)
Put **Caddy** (auto-HTTPS) or nginx + certbot in front, reverse-proxying 443 → `localhost:4007`.
Caddy one-liner `Caddyfile`:
```
studio.salestrig.com {
    reverse_proxy localhost:4007
}
```
Then add a DNS **A record** `studio` → the Elastic IP (at the registrar, same place as
the salestrig.com records). The marketing `/studio` CTAs currently point to `/contact` —
once this is live, repoint them to `https://studio.salestrig.com`.

## 7. After first boot
- Visit `https://studio.salestrig.com` → register the first (owner) account.
- Connect a social channel to smoke-test the OAuth + publishing pipeline.
- Confirm a Stripe **live** checkout creates a subscription (use a real card or a live
  test) and the webhook flips the subscription to active.

## Security checklist
- SSH key-only, port 22 limited to your IP; never expose Postgres/Redis/ES publicly.
- `.env.production` is NOT committed (gitignored).
- Rotate any secret that has been shared over chat/email.
- Take Postgres backups (`pg_dump` cron or RDS later).
- Set up log/health monitoring (the app exposes `/health`).

## Cost note
On-demand `t3.large` ≈ $60/mo (less with a Savings Plan). A comparable Hetzner/DO VPS
is ~€20–25/mo if cost matters more than the AWS ecosystem.
