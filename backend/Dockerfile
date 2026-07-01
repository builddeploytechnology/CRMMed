# ==============================
# Stage 1 : Composer
# ==============================
FROM composer:2 AS composer

WORKDIR /app

# Install packages required by composer
RUN apk add --no-cache \
    icu-dev \
    libzip-dev \
    zip \
    unzip \
    git

# Enable PHP extensions
RUN docker-php-ext-install intl zip

# Copy complete project
COPY . .

# Install dependencies without running artisan scripts
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts


# ==============================
# Stage 2 : PHP Runtime
# ==============================
FROM php:8.3-fpm

WORKDIR /var/www

# Install Linux packages
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        mbstring \
        bcmath \
        exif \
        pcntl \
        zip \
        intl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy application
COPY --from=composer /app /var/www

# Storage permissions
RUN mkdir -p storage/framework/{cache,sessions,views} \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

# Laravel optimize
RUN php artisan package:discover --ansi || true

EXPOSE 9000

CMD ["php-fpm"]