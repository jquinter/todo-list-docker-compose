#!/bin/sh
# Process only specific variables
envsubst '$BACKEND_URL,$NGINX_PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'