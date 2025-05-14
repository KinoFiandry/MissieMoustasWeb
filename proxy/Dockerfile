# proxy/Dockerfile
FROM httpd:2.4-alpine

# Installer openssl si vous voulez générer des certificats à la volée (optionnel)
RUN apk add --no-cache openssl

RUN mkdir -p /usr/local/apache2/conf/certs \
 && sed -i 's/#LoadModule ssl_module/LoadModule ssl_module/' /usr/local/apache2/conf/httpd.conf
# Activer les modules proxy, rewrite et ssl
RUN sed -i '/^#LoadModule proxy_module/s/^#//' /usr/local/apache2/conf/httpd.conf \
 && sed -i '/^#LoadModule proxy_http_module/s/^#//' /usr/local/apache2/conf/httpd.conf \
 && sed -i '/^#LoadModule ssl_module/s/^#//' /usr/local/apache2/conf/httpd.conf \
 && sed -i '/^#LoadModule socache_shmcb_module/s/^#//' /usr/local/apache2/conf/httpd.conf \
 && sed -i '/^#Include conf\/extra\/httpd-ssl.conf/s/^#//' /usr/local/apache2/conf/httpd.conf

# Copier votre httpd.conf principal
COPY conf/httpd.conf /usr/local/apache2/conf/httpd.conf

# Copier vos VirtualHosts additionnels (optionnel)
COPY conf/extra/*.conf /usr/local/apache2/conf/extra/

# Copiez les certificats dans le bon dossier
COPY certs/server.crt /usr/local/apache2/conf/certs/server.crt
COPY certs/server.key /usr/local/apache2/conf/certs/server.key

# S’assurer que le dossier existe
RUN mkdir -p /usr/local/apache2/conf/ssl && \
    mv /usr/local/apache2/conf/certs/* /usr/local/apache2/conf/ssl/

# Exposer HTTP et HTTPS
COPY certs/ /usr/local/apache2/conf/ssl/
EXPOSE 80 443

# Démarrage en avant-plan
CMD ["httpd-foreground"]
