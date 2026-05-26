# E-DAARA Backend — Dockerfile
# Image de base pour production

FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances (production uniquement)
RUN npm install --production

# Copier le code source
COPY . .

# Créer le répertoire des logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)});"

# Commande de démarrage
CMD ["node", "src/app.js"]
