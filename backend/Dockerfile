# ==========================
# Stage 1 - Composer
# ==========================
FROM composer:2 AS composer

WORKDIR /app

# PHP extensions required by Composer packages
RUN apk add --no-cache icu-dev

COPY composer.json composer.lock ./

RUN docker-php-ext-install intl

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader

COPY . .

RUN composer dump-autoload --optimize


# ==========================
# Stage 2 - PHP Runtime
# ==========================
FROM php:8.3-fpm

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    curl \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install \
        intl \
        pdo \
        pdo_mysql \
        mbstring \
        bcmath \
        exif \
        pcntl \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /app /var/www

RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]