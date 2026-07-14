# MasterTools — static site served by nginx, ready for Railway / any Docker host.
FROM nginx:alpine

# Copy the website into nginx's web root (Dockerfile, deploy/, .git are excluded via .dockerignore)
COPY . /usr/share/nginx/html

# Port-aware server config. Railway (and most PaaS) inject a $PORT env var;
# nginx:alpine runs envsubst on files in /etc/nginx/templates/ at startup and
# only substitutes REAL env vars (so $uri etc. are left untouched).
COPY deploy/default.conf.template /etc/nginx/templates/default.conf.template

# Fallback for local `docker run` without a PORT set.
ENV PORT=8080
EXPOSE 8080

# nginx:alpine's entrypoint renders the template, then this runs the server.
CMD ["nginx", "-g", "daemon off;"]
