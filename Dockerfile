FROM php:8.4-cli

# Install system dependencies & PHP extensions required by Laravel + MySQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install Composer dependencies first (layer caching)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --prefer-dist

# Copy application source
COPY . .

# Run Composer autoload & post-autoload scripts
RUN composer dump-autoload --optimize \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x docker/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
