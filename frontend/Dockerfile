# frontend/Dockerfile

# 1️⃣ Build de l’app React
FROM node:18-alpine AS build

WORKDIR /app

# Copier uniquement la définition des dépendances
COPY package.json package-lock.json ./

# Installer toutes les dépendances (incluant dev pour le build)
RUN npm ci

# Copier le code source nécessaire au build
COPY public ./public
COPY src    ./src

# Construire l’application
RUN npm run build

# 2️⃣ Serveur Nginx pour distribuer l’app
FROM nginx:stable-alpine

# Supprimer la configuration par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier votre config Nginx (à créer dans frontend/nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/

# Copier le build React
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
