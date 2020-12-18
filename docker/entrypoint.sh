#!/bin/sh
set -e

/env.sh "MELI_" "/www"

echo "Launching Caddy..."
exec "$@"
