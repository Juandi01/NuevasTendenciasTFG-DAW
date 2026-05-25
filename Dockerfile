FROM php:8.4-fpm-alpine

# System dependencies
RUN apk add --no-cache \
    bash \
    git \
    curl \
    unzip \
    icu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    postgresql-dev \
    libxslt-dev \
    libxml2-dev \
    zlib-dev \
    linux-headers

# GD (needs explicit configure before install)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install gd

# Database
RUN docker-php-ext-install pdo_pgsql pgsql

# Internationalization, compression, math
RUN docker-php-ext-install intl zip bcmath

# Text / serialization
RUN docker-php-ext-install mbstring xsl

# Networking
RUN docker-php-ext-install sockets

# Opcache ya viene compilado en la imagen base — solo hay que habilitarlo
RUN docker-php-ext-enable opcache

# Opcache tuning for production
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.save_comments=1'; \
} > /usr/local/etc/php/conf.d/opcache.ini

# PHP limits
RUN { \
    echo 'upload_max_filesize=64M'; \
    echo 'post_max_size=64M'; \
    echo 'memory_limit=256M'; \
    echo 'max_execution_time=120'; \
} > /usr/local/etc/php/conf.d/limits.ini

# Force PHP-FPM to listen on all interfaces (not just 127.0.0.1)
COPY docker/php/zz-docker.conf /usr/local/etc/php-fpm.d/zz-docker.conf

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies (production, no dev)
COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

# Copy application source
COPY . .

# Run composer scripts after full copy
RUN composer run-script post-install-cmd --no-interaction 2>/dev/null || true

# Compile assets for production and save to staging dir
# (public/assets/ se montará como volumen, guardamos copia en /opt/assets-dist)
RUN APP_ENV=prod APP_SECRET=build-time APP_DEBUG=0 \
    php bin/console asset-map:compile \
 && cp -r public/assets /opt/assets-dist

# Fix permissions
RUN mkdir -p var/cache var/log public/uploads \
 && chown -R www-data:www-data var public/uploads \
 && chmod +x docker/php/entrypoint.sh

ENTRYPOINT ["docker/php/entrypoint.sh"]
CMD ["php-fpm"]
