#!/usr/bin/env bash
# Incremental production deploy, run on the server by the Production pipeline.
#
# Only the services whose image changed are pulled and recreated; everything
# else (postgres, its volume, unchanged services) keeps running untouched.
#
#   BACKEND_TAG=<sha>    new backend image tag   (empty = keep the running one)
#   FRONTEND_TAG=<sha>   new frontend image tag  (empty = keep the running one)
#   INFRA_CHANGED=true   compose / nginx config changed: re-apply them
#
# The running image tags live in .env.deploy next to .env.prod. If a health
# check fails, the previous .env.deploy is restored and the old images return.
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/aurexis}"
REGISTRY_PREFIX="${REGISTRY_PREFIX:-ghcr.io/aboelhassan22omar}"
BACKEND_TAG="${BACKEND_TAG:-}"
FRONTEND_TAG="${FRONTEND_TAG:-}"
INFRA_CHANGED="${INFRA_CHANGED:-false}"
KEEP_BACKUPS="${KEEP_BACKUPS:-10}"

cd "$APP_DIR"

compose() {
  docker compose --env-file .env.prod --env-file .env.deploy -f docker-compose.prod.yml "$@"
}

set_var() {
  local key="$1" value="$2"
  { grep -v "^${key}=" .env.deploy || true; echo "${key}=${value}"; } > .env.deploy.tmp
  mv .env.deploy.tmp .env.deploy
}

wait_healthy() {
  local container="$1" status=""
  for _ in $(seq 1 60); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null || echo missing)"
    if [ "$status" = "healthy" ]; then
      echo "  ${container}: healthy"
      return 0
    fi
    sleep 5
  done
  echo "::error::${container} is ${status} after 5 minutes"
  docker logs --tail 60 "$container" || true
  return 1
}

reload_nginx() {
  # Recreated containers get new IPs; a reload makes nginx resolve them again.
  docker exec aurexis-prod-nginx nginx -t
  docker exec aurexis-prod-nginx nginx -s reload
}

touch .env.deploy
cp .env.deploy .env.deploy.prev

services=()
if [ -n "$BACKEND_TAG" ]; then
  set_var BACKEND_IMAGE "${REGISTRY_PREFIX}/aurexis-backend"
  set_var BACKEND_TAG "$BACKEND_TAG"
  services+=(backend)
fi
if [ -n "$FRONTEND_TAG" ]; then
  set_var FRONTEND_IMAGE "${REGISTRY_PREFIX}/aurexis-frontend"
  set_var FRONTEND_TAG "$FRONTEND_TAG"
  services+=(frontend)
fi

if [ ${#services[@]} -eq 0 ] && [ "$INFRA_CHANGED" != "true" ]; then
  echo "Nothing to deploy."
  exit 0
fi

echo "Deploying: ${services[*]:-config only} (infra changed: ${INFRA_CHANGED})"
compose config -q

if [ ${#services[@]} -gt 0 ]; then
  compose pull "${services[@]}"
fi

# A database snapshot before the backend runs its migrations.
if [[ " ${services[*]:-} " == *" backend "* ]]; then
  mkdir -p backups
  set -a; . ./.env.prod; set +a
  dump="backups/predeploy_$(date -u +%Y%m%d_%H%M%S).dump"
  docker exec aurexis-prod-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$dump"
  echo "Database backup: ${dump} ($(du -h "$dump" | cut -f1))"
  ls -1t backups/predeploy_*.dump | tail -n +"$((KEEP_BACKUPS + 1))" | xargs -r rm -f
fi

rollback() {
  trap - ERR
  echo "::error::Deploy failed - restoring the previous version"
  cp .env.deploy.prev .env.deploy
  if [ ${#services[@]} -gt 0 ]; then
    compose up -d --no-deps "${services[@]}" || true
  fi
  reload_nginx || true
  exit 1
}
trap rollback ERR

for service in "${services[@]}"; do
  echo "Updating ${service}..."
  compose up -d --no-deps "$service"
  wait_healthy "aurexis-prod-${service}"
done

if [ "$INFRA_CHANGED" = "true" ]; then
  echo "Applying compose / nginx changes..."
  compose up -d
  for container in aurexis-prod-postgres aurexis-prod-backend aurexis-prod-frontend aurexis-prod-nginx; do
    wait_healthy "$container"
  done
fi

reload_nginx
wait_healthy aurexis-prod-nginx
trap - ERR

docker image prune -f > /dev/null
echo "Deploy finished. Running images:"
docker ps --filter name=aurexis-prod --format '  {{.Names}}  {{.Image}}  {{.Status}}'
