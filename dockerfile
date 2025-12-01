FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git

RUN docker-php-ext-install pdo pdo_mysql mysqli zip

RUN a2enmod rewrite

WORKDIR /var/www/html

COPY ./app /var/www/html/app
COPY ./public /var/www/html/public


COPY vhost.conf /etc/apache2/sites-available/000-default.conf

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]

