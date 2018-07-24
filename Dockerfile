FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/csl /data/csl
COPY dist/shared /data/shared

EXPOSE 8020
