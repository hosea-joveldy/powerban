FROM php:8.5-apache

RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

RUN a2enmod rewrite

# Match www-data's UID/GID to the host user so files created by Apache/PHP
# (Laravel's storage/, bootstrap/cache/, etc.) are owned by the host user
ARG UID=1001
ARG GID=100

RUN groupmod -g ${GID} www-data && \
    usermod -u ${UID} -g ${GID} www-data && \
    find / -xdev -group 33 -exec chgrp -h www-data {} \; 2>/dev/null; \
    find / -xdev -user 33 -exec chown -h www-data {} \; 2>/dev/null; \
    true
