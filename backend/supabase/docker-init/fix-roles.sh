#!/bin/sh
# The postgres image's own baked-in init scripts (docker-entrypoint-initdb.d/
# init-scripts/*.sql) create the Supabase service roles (supabase_storage_admin,
# supabase_auth_admin, authenticator, anon, service_role) with NO password at
# all — `CREATE USER ... LOGIN` with no PASSWORD clause. On a real `supabase
# start`, the CLI itself sets these passwords as a separate step outside the
# image; since we're not using the CLI, we do it here instead. Runs once,
# right after `db` is healthy — `storage` depends on this completing, since
# it authenticates as supabase_storage_admin over the network (SCRAM), which
# fails until the password is actually set to something.
set -eu

export PGPASSWORD="$POSTGRES_PASSWORD"
# supabase_admin, not postgres — a migration baked into this image
# (revoke_admin_roles_from_postgres) strips postgres of the privileges
# needed to alter these reserved roles, matching Supabase's hosted
# platform. supabase_admin is the actual superuser here.
CONN="-h $POSTGRES_HOST -p 5432 -U supabase_admin -d postgres"

until psql $CONN -c 'select 1' > /dev/null 2>&1; do
  echo "fix-roles: waiting for database..."
  sleep 1
done

for role in supabase_storage_admin supabase_auth_admin authenticator anon service_role; do
  psql $CONN -v ON_ERROR_STOP=1 -c "ALTER ROLE $role WITH PASSWORD '$POSTGRES_PASSWORD'"
done

echo "fix-roles: done"
