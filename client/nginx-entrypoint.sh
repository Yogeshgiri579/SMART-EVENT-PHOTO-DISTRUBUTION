#!/bin/sh
# At container startup, substitute ${BACKEND_URL} in the nginx template
# and write the result to the real config location, then start nginx.
#
# BACKEND_URL must be set as an env var in Render (or Docker Compose).
# Example value: https://momentdrop-backend.onrender.com
#
# Fallback to localhost for local Docker Compose runs (no env var set).
: "${BACKEND_URL:=http://backend:5000}"

envsubst '${BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
