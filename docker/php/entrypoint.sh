#!/bin/sh
set -e

export APP_ENV="${APP_ENV:-prod}"
export APP_DEBUG="${APP_DEBUG:-0}"

echo "Starting in APP_ENV=${APP_ENV}"

# Copiar assets compilados al volumen compartido con Nginx
if [ -d /opt/assets-dist ]; then
    echo "Syncing compiled assets to public/assets/..."
    mkdir -p public/assets
    cp -r /opt/assets-dist/. public/assets/
    chown -R www-data:www-data public/assets/
fi

echo "Waiting for PostgreSQL..."
until php -r "
  \$url = parse_url(getenv('DATABASE_URL'));
  new PDO(
    'pgsql:host='.\$url['host'].';port='.(\$url['port'] ?? 5432).';dbname='.ltrim(\$url['path'],'/'),
    \$url['user'],
    \$url['pass']
  );
" 2>/dev/null; do
    echo "  ...not ready yet, retrying in 2s"
    sleep 2
done
echo "PostgreSQL is ready."

echo "Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "Warming up cache..."
php bin/console cache:warmup

mkdir -p var/cache/dev/profiler var/cache/prod/profiler var/log
chmod -R 777 var/

echo "Application ready."
exec "$@"
