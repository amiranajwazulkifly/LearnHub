# Running LearnHub with Docker

The whole stack — Postgres, file storage, the Express API, and the React
frontend — runs in Docker. Nothing needs to be installed locally except
Docker itself.

## Quick start (local dev)

```bash
docker compose up -d
```

First run takes a minute or two (pulling images, building, running
migrations + seed). After that:

| Service  | URL                          |
| -------- | ----------------------------- |
| Frontend | http://localhost:5175         |
| Backend API | http://localhost:5001/api  |
| Postgres | localhost:54322 (`postgres`/`postgres`) |

Log in with any of the seeded accounts (see `backend/supabase/seed.sql`),
e.g. `admin@learnhub.local` / `TestPass123!`.

Source is bind-mounted for both `backend` and `frontend`, so normal file
edits hot-reload (nodemon / Vite HMR) exactly like running them natively —
no rebuild needed for code changes. You only need to rebuild
(`docker compose up -d --build`) after changing `package.json` or a
Dockerfile.

To stop everything (keeping data): `docker compose stop`
To stop and wipe all data (fresh start): `docker compose down -v`

## Optional: Supabase Studio (DB browser)

Not needed to run the app — just a nice-to-have UI for browsing tables.
Opt in with:

```bash
docker compose --profile tools up -d
```

Studio: http://localhost:54323. Its Storage-browsing tab won't work (that
needs the full Kong gateway, which this setup deliberately skips — see
"What's included" below); the Table Editor works fine.

Because it's a separate profile, remember `--profile tools` again when
tearing down too: `docker compose --profile tools down`.

## Production

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

This swaps `backend`/`frontend` to their production Docker targets — no
nodemon, no bind-mounted source, no Vite dev server. The frontend becomes a
static build served by nginx (port 8080 by default, override with
`FRONTEND_PORT`). `VITE_API_BASE_URL` is **required** and gets baked into
the frontend's JS bundle at build time (Vite inlines `VITE_*` vars at build,
not runtime — there's no way to change it after the fact without rebuilding).

Also set real secrets before deploying anywhere that isn't your own machine
— the defaults are the well-known Supabase CLI local-dev demo values,
fine for local dev, not for anything public:

```bash
POSTGRES_PASSWORD=<random>
JWT_SECRET=<random, this app's own auth — unrelated to the Supabase keys>
SUPABASE_JWT_SECRET=<random>
SUPABASE_ANON_KEY=<matching JWT>
SUPABASE_SERVICE_ROLE_KEY=<matching JWT>
```

(Put these in a root `.env` — see `.env.example` — or your platform's
secret manager.) `docker-compose.prod.yml` doesn't include Studio/pg-meta
at all (they're profile-gated, and prod never activates that profile), and
doesn't expose Postgres's port to the host.

## What's included, and why

This is Supabase's self-hosted stack trimmed from ~12 services down to the
~7 this app and team actually use:

- **db** — Postgres (the official `supabase/postgres` image, not vanilla —
  it bundles the roles/extensions/schemas `storage` needs).
- **fix-roles** — one-shot. The image creates Supabase's service roles
  (`supabase_storage_admin`, etc.) with *no password at all*; a real
  `supabase start` sets these itself as a step outside the image. This
  replicates that step. Runs once per fresh volume.
- **storage** — Supabase's storage-api. The only Supabase feature this app
  actually calls (`backend/src/utils/fileStorage.js`, for assignment file
  attachments) — bootstraps its own `storage` schema on first boot.
- **storage-gateway** — a ~15-line nginx config, not the full Kong gateway.
  The `@supabase/supabase-js` client always calls `{url}/storage/v1/...`
  (normally Kong's job to route), but storage-api itself serves no such
  prefix. This does just that one rewrite instead of running all of Kong.
- **migrate** — one-shot. Applies `backend/supabase/migrations/*.sql` (in
  filename/chronological order) then `seed.sql`. Idempotent — safe to
  re-run against an existing volume, it no-ops if already applied.
- **backend**, **frontend** — this app.
- **pg-meta**, **studio** *(opt-in, `--profile tools`)* — DB browser UI.
  Zero role in the running app.

**Deliberately not included**: Auth/gotrue, Realtime, PostgREST, Kong (the
full gateway), Edge Functions, Analytics/Logflare, Vector, imgproxy. This
app uses its own custom JWT auth (not Supabase Auth) and never touches any
of the others — running them would just be ~5 extra containers with no
functional benefit, and meaningfully more moving parts to keep healthy.

## Troubleshooting

**Port already in use** — something else on your machine is using one of
5175 / 5001 / 54321 / 54322 / 54323. Either stop that thing, or override
the port via env var (see `.env.example`) — e.g. `DB_PORT=55432 docker
compose up -d`.

**Backend crash-looping with `nodemon: not found` or similar** — a stale
`backend-node-modules` (or `frontend-node-modules`) named volume from a
previous `package.json` state. Fix: `docker compose down && docker volume
rm learnhub_backend-node-modules learnhub_frontend-node-modules && docker
compose up -d`.

**Frontend serving the wrong build (dev vs. prod)** — dev and prod each
build to a distinct image tag (`learnhub-frontend:dev` /
`learnhub-frontend:prod`) specifically so this can't happen silently, but
if you ever see stale behavior after switching between them, add `--build`
to force a rebuild.

**Migrations already ran but you added a new one** — `migrate`'s
idempotency check is coarse (skips *all* migrations if `public.users`
already exists, since Postgres doesn't track individual applied migrations
outside the Supabase CLI). Re-running `docker compose up migrate` again is
enough for one-off cases: it'll skip straight to the seed. If a new
`.sql` file needs to run against an existing database, apply it directly
(`docker compose exec db psql -U postgres -f -` or similar) rather than
relying on `migrate`.
