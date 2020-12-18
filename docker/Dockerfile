FROM caddy:2-alpine

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/env.sh /env.sh

RUN chmod +x /entrypoint.sh /env.sh

COPY ./build /www

LABEL maintainer="meli.sh"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
