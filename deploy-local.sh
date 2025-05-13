#!/usr/bin/env bash
set -e

echo "Arrêt et suppression des anciens conteneurs..."
docker-compose down

echo "Démarrage en mode détaché..."
docker-compose up --build -d

echo "✅ MissieMoustassWeb est disponible sur http://localhost:3000"