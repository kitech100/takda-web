FROM php:8.5-fpm-alpine AS php-base

RUN set -eux; \
    apk add --no-cache \
        bash \
        curl \
        freetype \
        icu-libs \
        libjpeg-turbo \
        libpng \
        libzip \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        freetype-dev \
        icu-dev \
        libjpeg-turbo-dev \
        linux-headers \
        libpng-dev \
        libzip-dev

RUN set -eux; \
    docker-php-ext-configure gd --with-freetype --with-jpeg; \
    docker-php-ext-install -j2 \
        bcmath \
        gd \
        intl \
        pcntl \
        pdo_mysql \
        sockets \
        zip

RUN set -eux; \
    pecl install redis-6.3.0; \
    docker-php-ext-enable redis; \
    php -r 'foreach (["Zend OPcache", "pcntl", "posix", "pdo_mysql", "redis"] as $extension) { if (! extension_loaded($extension)) { fwrite(STDERR, "Missing PHP extension: {$extension}\n"); exit(1); } }'; \
    rm -rf /tmp/pear; \
    apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-takda.ini

WORKDIR /var/www/html

FROM php-base AS development

CMD ["php-fpm", "-F"]

FROM php-base AS php-builder

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

COPY . .
RUN composer run-script post-autoload-dump \
    && php artisan wayfinder:generate --with-form

FROM node:22-alpine AS frontend-builder

WORKDIR /app
ENV WAYFINDER_COMMAND=true
COPY --from=php-builder /var/www/html ./
RUN npm ci && npm run build

FROM php-base AS production

ENV APP_ENV=production
ENV APP_DEBUG=false

COPY --from=php-builder --chown=www-data:www-data /var/www/html /var/www/html
COPY --from=frontend-builder --chown=www-data:www-data /app/public/build /var/www/html/public/build

RUN mkdir -p \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

USER www-data
CMD ["php-fpm", "-F"]

FROM nginx:1.29-alpine AS nginx-production

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/public /var/www/html/public
