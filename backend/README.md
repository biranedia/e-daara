# E-DAARA Backend API — Guide de démarrage

## 📋 Vue d'ensemble

Backend API REST pour E-DAARA, une plateforme d'apprentissage en ligne gratuite et souveraine pour l'Afrique.

**Stack technologique:**

- Node.js + Express.js
- MySQL 8.0
- JWT + OAuth 2.0
- Swagger/OpenAPI documentation
- Winston logging
- Passport.js

---

## 🚀 Installation rapide

### 1. Prérequis

- Node.js 16+ et npm 8+
- MySQL 8.0 en cours d'exécution
- Base de données `edaara_db` créée avec le schéma fourni

### 2. Installation des dépendances

```bash
cd c:\xampp\htdocs\E-DAARA\backend
npm install
```

### 3. Configuration de l'environnement

Copier le fichier `.env.example` en `.env` et configurer les variables:

```bash
cp .env.example .env
```

**Variables essentielles à configurer:**

```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=edaara_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=votre_clé_secrète_très_longue_au_moins_32_caractères

# OAuth Google (optionnel)
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret

# CORS
CORS_ORIGIN=http://localhost:4200,http://localhost:3000
```

### 4. Initialiser la base de données

```bash
# Importer le schéma SQL
mysql -u root -p edaara_db < ../database/edaara_schema_complet.sql

# Importer les rôles et permissions
mysql -u root -p edaara_db < ./database/seed-rbac.sql
```

### 5. Démarrer le serveur

**Mode développement** (avec auto-reload):

```bash
npm run dev
```

**Mode production**:

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 📚 Documentation API

La documentation Swagger/OpenAPI est disponible sur:

```
http://localhost:3000/api-docs
```

---

## 🔐 Authentification

### Format Bearer Token

Toutes les routes protégées attendent un header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Flux d'authentification

#### 1. Inscription

```bash
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Diao",
  "prenom": "Birane",
  "email": "birane@edaara.sn",
  "password": "SecurePass123!"
}
```

**Réponse:**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "birane@edaara.sn",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

#### 2. Connexion

```bash
POST /api/auth/login
{
  "email": "birane@edaara.sn",
  "password": "SecurePass123!"
}
```

#### 3. Renouveler le token

```bash
POST /api/auth/refresh-token
{
  "refreshToken": "eyJhbGc..."
}
```

#### 4. Réinitialiser le mot de passe

```bash
POST /api/auth/forgot-password
{
  "email": "birane@edaara.sn"
}

POST /api/auth/reset-password
{
  "token": "hash_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

---

## 👥 Rôles et permissions (RBAC)

Quatre rôles principaux:

| Rôle                | Permissions                             | Description                        |
| -------------------- | --------------------------------------- | ---------------------------------- |
| **admin**      | Tous les droits                         | Gestion complète de la plateforme |
| **instructor** | Créer/éditer cours, créer quiz       | Formateurs                         |
| **student**    | S'inscrire à des cours, soumettre quiz | Apprenants                         |
| **visitor**    | Consulter catalogue                     | Visiteurs non authentifiés        |

### Vérifier les permissions

```bash
GET /api/users/profile
Authorization: Bearer <JWT_TOKEN>
```

Retourne les rôles et permissions de l'utilisateur.

---

## 📦 Structure du projet

```
backend/
├── src/
│   ├── app.js                 # Entrée principale Express
│   ├── config/
│   │   └── database.js        # Configuration MySQL
│   ├── middlewares/
│   │   ├── auth.js            # JWT, OAuth
│   │   └── rbac.js            # Rôles et permissions
│   ├── controllers/
│   │   └── authController.js  # Logique auth
│   ├── routes/
│   │   ├── auth.js            # Routes authentification
│   │   ├── public.js          # Routes publiques
│   │   ├── users.js           # Routes profil utilisateur
│   │   ├── courses.js         # Routes cours
│   │   ├── paths.js           # Routes parcours
│   │   ├── enrollments.js     # Routes inscriptions
│   │   ├── assessments.js     # Routes quiz/évaluations
│   │   ├── lessons.js         # Routes leçons
│   │   ├── dashboard.js       # Routes tableau de bord
│   │   └── admin.js           # Routes administration
│   ├── utils/
│   │   └── logger.js          # Logging Winston
│   └── database/
│       └── seed-rbac.sql      # Données initiales
├── logs/                      # Fichiers logs
├── .env                       # Variables d'environnement
├── .env.example               # Template env
├── package.json
└── README.md

```

---

## 🎯 Endpoints principaux

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh-token` - Renouveler token
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/forgot-password` - Réinitialiser mot de passe

### Utilisateurs

- `GET /api/users/profile` - Mon profil
- `PUT /api/users/profile` - Modifier profil
- `POST /api/users/change-password` - Changer mot de passe

### Catalogue (public)

- `GET /api/public/courses` - Lister les cours publiés
- `GET /api/public/courses/:id` - Détails d'un cours
- `GET /api/public/paths` - Lister les parcours
- `GET /api/public/categories` - Lister les catégories

### Cours (formateur)

- `GET /api/courses` - Mes cours
- `POST /api/courses` - Créer un cours
- `GET /api/courses/:id` - Détails d'un cours
- `PUT /api/courses/:id` - Modifier un cours
- `DELETE /api/courses/:id` - Supprimer un cours

### Administration

- `GET /api/admin/dashboard` - Statistiques globales
- `GET /api/admin/users` - Lister utilisateurs
- `PUT /api/admin/users/:id/status` - Changer statut utilisateur
- `GET /api/admin/courses/pending` - Cours en attente de validation
- `POST /api/admin/courses/:id/validate` - Valider/refuser un cours
- `GET /api/admin/audit-logs` - Consulter les logs d'audit

---

## 🔒 Sécurité

### Mesures implémentées

1. **JWT avec expiration courte** (15 min)
2. **Refresh tokens stockés en BD** (30 jours)
3. **Bcrypt** pour les mots de passe (12 salt rounds)
4. **HTTPS/TLS** recommandé en production
5. **CORS** configuré pour les origines autorisées
6. **Rate limiting** sur les routes API
7. **Helmet** pour les headers de sécurité HTTP
8. **Audit logs** complets des actions sensibles

### OWASP Protection

- ✅ Injection SQL: Requêtes paramétrées avec MySQL2
- ✅ XSS: Validation inputs, sanitization
- ✅ CSRF: Tokens CSRF (optionnel via middleware)
- ✅ Authentification: JWT + OAuth 2.0
- ✅ Autorisation: RBAC granulaire
- ✅ Sensible data: Soft delete, logs d'audit

---

## 📊 Logs et monitoring

### Fichiers logs

Les logs sont écrits dans le répertoire `./logs/`:

- `app.log` - Tous les logs (info, warn, error)
- `error.log` - Erreurs uniquement

### Format logs

```
2025-05-17 10:30:45 [INFO] ✓ Utilisateur connecté: birane@edaara.sn
2025-05-17 10:31:12 [ERROR] Erreur lors du chargement des cours: Database connection failed
```

### Niveau de log

Configurable via `LOG_LEVEL` dans `.env`:

- `error` - Erreurs critiques
- `warn` - Avertissements
- `info` - Informations générales
- `http` - Requêtes HTTP
- `debug` - Détails de débogage

---

## 🧪 Tests

```bash
# Lancer les tests unitaires
npm test

# Tests avec couverture de code
npm run test -- --coverage

# Mode watch (tests en continu)
npm run test:watch
```

---

## 🚢 Déploiement en production

### Configuration recommandée

1. **Variables d'environnement sécurisées**

   ```bash
   NODE_ENV=production
   JWT_SECRET=<64_chars_secure_random_string>
   ```
2. **Reverse proxy Nginx**

   ```nginx
   server {
     listen 443 ssl http2;
     server_name api.edaara.sn;

     ssl_certificate /etc/letsencrypt/live/edaara.sn/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/edaara.sn/privkey.pem;

     location /api {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```
3. **Process manager (PM2)**

   ```bash
   npm install -g pm2
   pm2 start src/app.js --name "edaara-api"
   pm2 startup
   pm2 save
   ```
4. **Sauvegarde BD**

   ```bash
   # Backup quotidien
   0 2 * * * mysqldump -u root -p $DB_PASSWORD edaara_db | gzip > /backups/edaara_$(date +\%Y\%m\%d).sql.gz
   ```

---

## 🐛 Dépannage

### Erreur: "Cannot find module 'mysql2'"

```bash
npm install mysql2
```

### Erreur: "Connection refused"

- Vérifier que MySQL est en cours d'exécution
- Vérifier `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` dans `.env`
- S'assurer que la base `edaara_db` existe

### Erreur: "JWT_SECRET not defined"

- Vérifier que `JWT_SECRET` est défini dans `.env`
- Minimum 32 caractères recommandé

### Port déjà utilisé

```bash
# Changer le PORT dans .env
PORT=3001

# Ou trouver le processus qui utilise le port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📞 Support et documentation

- 📖 **Mémoire/Cahier des Charges**: `../docs/`
- 📋 **Schéma BD**: `../database/edaara_schema_complet.sql`
- 🔗 **Swagger/OpenAPI**: `http://localhost:3000/api-docs`

---

## 📜 Licence

AGPL-3.0 - Voir LICENSE pour détails

---

**Auteur**: Birane Diao — IPG/ISTI — Licence Génie Logiciel IG3
**Date**: Mai 2025
