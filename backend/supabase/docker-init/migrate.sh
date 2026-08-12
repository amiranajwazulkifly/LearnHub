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

# Idempotent: if the app schema is already there (a re-run against an
# existing volume), skip straight to re-applying the seed, which is itself
# safe to re-run (ON CONFLICT DO NOTHING/UPDATE throughout).
already_migrated=$(psql $CONN -tAc "select to_regclass('public.users') is not null")

if [ "$already_migrated" != "t" ]; then
  for f in /migrations/*.sql; do
    echo "migrate: applying $(basename "$f")"
    psql $CONN -v ON_ERROR_STOP=1 -f "$f"
  done
else
  echo "migrate: public.users already exists, skipping migrations"
fi

echo "migrate: applying seed.sql"
psql $CONN -v ON_ERROR_STOP=1 -f /seed.sql

echo "migrate: done"
