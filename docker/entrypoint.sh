#!/usr/bin/env bash
set -e

cd /var/www/html

# 1. Pastikan file .env tersedia & sinkron dengan environment Docker
if [ ! -f .env ]; then
    cp .env.example .env
fi

sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=${DB_CONNECTION:-mysql}|" .env
sed -i "s|^DB_HOST=.*|DB_HOST=${DB_HOST:-db}|" .env
sed -i "s|^DB_PORT=.*|DB_PORT=${DB_PORT:-3306}|" .env
sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${DB_DATABASE:-smartwarehouse}|" .env
sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${DB_USERNAME:-smartwarehouse}|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD:-secret}|" .env

# 2. Generate APP_KEY bila belum terisi
if ! grep -q "^APP_KEY=base64:" .env; then
    php artisan key:generate --force
fi

# 3. Tunggu koneksi MySQL siap
if [ "${DB_CONNECTION}" = "mysql" ]; then
    echo "Menunggu MySQL di ${DB_HOST:-db}:${DB_PORT:-3306}..."
    until php -r "new PDO('mysql:host=' . (getenv('DB_HOST') ?: 'db') . ';port=' . (getenv('DB_PORT') ?: '3306') . ';dbname=' . (getenv('DB_DATABASE') ?: 'smartwarehouse'), getenv('DB_USERNAME') ?: 'root', getenv('DB_PASSWORD') ?: '');" >/dev/null 2>&1; do
        sleep 2
    done
    echo "MySQL siap!"
fi

# 4. Jalankan migrasi
php artisan migrate --force

# 5. Jalankan seeder hanya jika tabel devices masih kosong (agar data testing tidak ter-reset saat container restart)
DEVICE_COUNT=$(php -r "require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo App\Models\Device::count();")
if [ "${DEVICE_COUNT}" = "0" ]; then
    echo "Tabel devices kosong — menjalankan DeviceSeeder (3 perangkat, 30 pembacaan)..."
    php artisan db:seed --force
fi

exec "$@"
