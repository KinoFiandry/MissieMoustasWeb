# MissieMoustasWeb
![SonarCloud](https://sonarcloud.io/api/project_badges/measure?project=KinoFiandry_MissieMoustasWeb_9e6dece9dcdb810ffdb73f0acc6057b1ff1933c5&metric=alert_status)
![CI](https://github.com/votre-org/MissieMoustassWeb/actions/workflows/ci.yml/badge.svg)

Application d’envoi de messages vocaux chiffrés.

## Prérequis
- Docker & docker-compose
- (Optionnel) Node.js pour dev en local

## Déploiement local
```bash
# Clonez
git clone https://github.com/votre-org/MissieMoustassWeb.git
cd MissieMoustassWeb
# Lancez les services
./deploy-local.sh
# Accédez à l’UI
http://localhost:3000