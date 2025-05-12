# Utilise l'image officielle Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY backend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code
COPY backend/ ./

# Exposer le port de l'API
EXPOSE 3001

# Démarrer le serveur
CMD ["node", "server.js"]