FROM nginx:1.20.0-alpine

# COPY docker/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY build /usr/share/nginx/html
# COPY docker/entrypoint.sh /

# RUN chmod +x entrypoint.sh

# ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]