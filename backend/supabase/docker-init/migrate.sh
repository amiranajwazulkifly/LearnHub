#!/bin/sh
# Runs once, as a one-shot Compose service, against the `db` container:
# applies every file in supabase/migrations/ (in filename order — they're
# timestamp-prefixed, so that's chronological) then supabase/seed.sql.
#
# Deliberately separate from the `db` image's own /docker-entrypoint-initdb.d
# bootstrapping (which sets up Supabase's own roles/schemas) rather than
# hooking into it, so this script never risks shadowing that image's
# baked-in init files. It runs after `storage` is healthy because one
# migration (create_assignments) inserts into storage.buckets, which only
# exists once storage-api has bootstrapped its own schema.
set -eu

export PGPASSWORD="$POSTGRES_PASSWORD"
CONN="-h $POSTGRES_HOST -p 5432 -U $POSTGRES_USER -d $POSTGRES_DB"

echo "migrate: waiting for database to accept connections..."
until psql $CONN -c 'select 1' > /dev/null 2>&1; do
  sleep 1
done

# Tracks applied migrations by filename in public.schema_migrations, so a
# migration added after a volume was first created still gets applied on the
# next `docker compose up`.
#
# The previous version skipped every migration as soon as public.users
# existed, which meant any new migration silently never ran against an
# existing database.
psql $CONN -v ON_ERROR_STOP=1 -q -c "
  CREATE TABLE IF NOT EXISTS public.schema_migrations (
    filename   TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )"

# A database created before tracking existed already has the original
# schema, but no record of it. Mark those baseline migrations as applied
# rather than re-running them — they aren't idempotent and would fail.
# Everything after the baseline goes through the normal path below.
# Timestamp prefix of the last migration that predates tracking.
BASELINE=20260811180000

has_schema=$(psql $CONN -tAc "select to_regclass('public.users') is not null")
tracked=$(psql $CONN -tAc "select count(*) from public.schema_migrations")

if [ "$has_schema" = "t" ] && [ "$tracked" = "0" ]; then
  echo "migrate: existing schema without tracking, recording baseline"
  for f in /migrations/*.sql; do
    name=$(basename "$f")
    # Integer comparison on the numeric prefix — POSIX `[` has no portable
    # string less-than.
    if [ "${name%%_*}" -le "$BASELINE" ]; then
      psql $CONN -v ON_ERROR_STOP=1 -q -c \
        "INSERT INTO public.schema_migrations (filename) VALUES ('$name') ON CONFLICT DO NOTHING"
    fi
  done
fi

for f in /migrations/*.sql; do
  name=$(basename "$f")
  applied=$(psql $CONN -tAc "select 1 from public.schema_migrations where filename = '$name'")

  if [ "$applied" = "1" ]; then
    continue
  fi

  echo "migrate: applying $name"
  # ON_ERROR_STOP makes a failing migration abort the script before it is
  # recorded, so it is retried on the next run. (Not wrapped in one
  # transaction here: two of the original migrations manage their own
  # BEGIN/COMMIT.)
  psql $CONN -v ON_ERROR_STOP=1 -q -f "$f"
  psql $CONN -v ON_ERROR_STOP=1 -q -c \
    "INSERT INTO public.schema_migrations (filename) VALUES ('$name')"
done

echo "migrate: applying seed.sql"
psql $CONN -v ON_ERROR_STOP=1 -f /seed.sql

echo "migrate: done"
