# 📁 Guide des fichiers du backend E-DAARA

**Emplacement**: `C:\xampp\htdocs\E-DAARA\backend\`

---

## 📚 Où commencer?

### 🎯 Débutant? Commencez par:

1. **[QUICKSTART.md](./QUICKSTART.md)** ← **ICI** (5 min)
   - Démarrage rapide du serveur
   - Tester les endpoints
   - Aucune configuration compliquée

2. **[CHECKLIST.md](./CHECKLIST.md)** (10 min)
   - Checklist complète étape par étape
   - Chaque étape validée
   - Pour une première installation

### 👨‍💻 Développeur? Consultez:

1. **[README.md](./README.md)** (30 min)
   - Guide complet d'installation
   - Tous les endpoints documentés
   - Configuration complète
   - Troubleshooting

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** (20 min)
   - Diagrammes flux
   - Architecture n-tier
   - Sécurité en couches
   - Scalabilité

3. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** (10 min)
   - Résumé du projet
   - Fichiers créés
   - Fonctionnalités implémentées

### 📖 Swagger/OpenAPI:

```
http://localhost:3000/api-docs
```

Documentation interactive - testable directement

---

## 📂 Arborescence des fichiers

```
backend/
│
├── 📄 DOCUMENTATION (Ces fichiers!)
│   ├── README.md                 ← Guide complet
│   ├── QUICKSTART.md             ← Démarrage rapide  
│   ├── CHECKLIST.md              ← Checklist étapes
│   ├── ARCHITECTURE.md           ← Architecture
│   ├── PROJECT_SUMMARY.md        ← Résumé du projet
│   └── FILE_GUIDE.md             ← Ce fichier
│
├── 📦 CONFIGURATION
│   ├── package.json              ← Dépendances npm
│   ├── package-lock.json         ← Lock file (auto-généré)
│   ├── .env.example              ← Template variables env
│   ├── .env                      ← À CRÉER (copie de .example)
│   ├── .eslintrc.json            ← Linting ESLint
│   ├── jest.config.js            ← Tests Jest
│   └── .gitignore                ← Fichiers ignorés Git
│
├── 🐳 DÉPLOIEMENT
│   ├── Dockerfile                ← Image Docker
│   ├── docker-compose.yml        ← Orchestration Docker
│   ├── nginx.conf                ← Reverse proxy Nginx
│   └── kubernetes/               ← (Optionnel) K8s configs
│
├── 📁 src/ (Code source)
│   ├── app.js                    ← Express app principal
│   │
│   ├── config/
│   │   └── database.js           ← MySQL pool + queries
│   │
│   ├── middlewares/
│   │   ├── auth.js               ← JWT, OAuth, refresh
│   │   └── rbac.js               ← Rôles, permissions, audit
│   │
│   ├── controllers/
│   │   └── authController.js     ← Logique authentification
│   │
│   ├── routes/ (Endpoints API)
│   │   ├── auth.js               ← POST /auth/*
│   │   ├── public.js             ← GET /public/* (public)
│   │   ├── users.js              ← GET/PUT /users/*
│   │   ├── courses.js            ← CRUD /courses/*
│   │   ├── paths.js              ← CRUD /paths/* (parcours)
│   │   ├── enrollments.js        ← POST /enrollments/*
│   │   ├── assessments.js        ← CRUD /assessments/* (quiz)
│   │   ├── lessons.js            ← CRUD /lessons/*
│   │   ├── dashboard.js          ← GET /dashboard/*
│   │   └── admin.js              ← GET/POST /admin/*
│   │
│   ├── utils/
│   │   ├── logger.js             ← Winston logging
│   │   ├── validation.js         ← Joi schemas (à créer)
│   │   ├── helpers.js            ← Utilitaires (à créer)
│   │   └── constants.js          ← Constantes (à créer)
│   │
│   ├── database/
│   │   └── seed-rbac.sql         ← Données initiales
│   │
│   └── __tests__/ (Tests)
│       ├── auth.test.js          ← Tests auth (à créer)
│       ├── courses.test.js       ← Tests courses (à créer)
│       └── rbac.test.js          ← Tests RBAC (à créer)
│
├── 📊 logs/ (Générés au runtime)
│   ├── app.log                   ← Tous les logs
│   └── error.log                 ← Erreurs seulement
│
├── 📂 node_modules/ (Dépendances - ignoré)
│   └── (Générés après npm install)
│
└── 📂 database/ (Scripts BD)
    ├── edaara_schema_complet.sql ← Schéma principal
    └── seed-rbac.sql             ← Données RBAC
```

---

## 📖 Descriptions des fichiers clés

### Configuration (`/`)

#### `package.json`
- **Quoi**: Dépendances npm et scripts
- **Editer**: Pour ajouter des packages
- **Scripts**:
  - `npm start` - Production
  - `npm run dev` - Développement
  - `npm test` - Tests
  - `npm run lint` - Linting

#### `.env` (À CRÉER)
- **Quoi**: Variables d'environnement (secrets, config)
- **Créer**: `copy .env.example .env`
- **Éditer**: Paramètres spécifiques à l'environnement
- **Important**: Ne pas commiter ce fichier!

#### `.eslintrc.json`
- **Quoi**: Règles linting du code
- **Éditer**: Pour adapter aux préférences d'équipe

#### `jest.config.js`
- **Quoi**: Configuration tests Jest
- **Éditer**: Seuil couverture, chemins d'exclusion

### Code source (`src/`)

#### `app.js` ⭐ POINT D'ENTRÉE
- **Quoi**: Application Express principale
- **Contient**:
  - Configuration middlewares
  - Routes principales
  - Gestionnaire erreurs
  - Démarrage serveur
- **À savoir**: C'est ici que tout commence!

#### `config/database.js` 🗄️ DATABASE
- **Quoi**: Connexion MySQL + helpers de requêtes
- **Contient**:
  - Pool de connexions
  - Fonctions: query(), queryOne(), queryWithMetadata()
- **À utiliser**: Dans tous les contrôleurs/routes

#### `middlewares/auth.js` 🔐 AUTHENTIFICATION
- **Quoi**: JWT, OAuth, token refresh
- **Exports**:
  - `verifyJWT()` - Vérifier token JWT obligatoire
  - `optionalJWT()` - JWT optionnel
  - `generateAccessToken()` - Créer access token
  - `generateRefreshToken()` - Créer refresh token
  - `refreshAccessToken()` - Renouveler token

#### `middlewares/rbac.js` 👥 RÔLES & PERMISSIONS
- **Quoi**: Contrôle d'accès basé rôles
- **Exports**:
  - `loadRBACContext()` - Charger rôles/permissions
  - `requireRole('admin')` - Vérifier rôle
  - `requirePermission('courses:create')` - Vérifier permission
  - `auditLogger()` - Enregistrer actions
  - `logAudit()` - Fonction d'audit manuelle

#### `controllers/authController.js` 🔑 LOGIQUE AUTH
- **Quoi**: Logique métier pour authentification
- **Fonctions**:
  - `register()` - Inscription
  - `login()` - Connexion
  - `refreshToken()` - Renouveler token
  - `logout()` - Déconnexion
  - `forgotPassword()` - Réinitialisation
  - `resetPassword()` - Réinitialiser mot de passe

#### `routes/auth.js`
- **Quoi**: Endpoints d'authentification
- **Endpoints**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh-token`
  - `POST /api/auth/logout`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

#### `routes/public.js` 🌍 PUBLIC
- **Quoi**: Endpoints publics (pas d'auth)
- **Endpoints**:
  - `GET /api/public/courses` - Lister cours
  - `GET /api/public/courses/:id` - Détails cours
  - `GET /api/public/paths` - Lister parcours
  - `GET /api/public/categories` - Lister catégories

#### `routes/courses.js` 📚 COURS
- **Quoi**: Gestion des cours (CRUD)
- **Endpoints**:
  - `GET /api/courses` - Mes cours
  - `POST /api/courses` - Créer cours
  - `GET /api/courses/:id` - Détails
  - `PUT /api/courses/:id` - Modifier
  - `DELETE /api/courses/:id` - Supprimer
- **Sécurité**: Nécessite JWT + rôle instructor/admin

#### `routes/admin.js` ⚙️ ADMINISTRATION
- **Quoi**: Routes administrateur
- **Endpoints**:
  - `GET /api/admin/dashboard` - Stats globales
  - `GET /api/admin/users` - Liste utilisateurs
  - `PUT /api/admin/users/:id/status` - Changer statut
  - `GET /api/admin/courses/pending` - Cours en attente
  - `POST /api/admin/courses/:id/validate` - Valider cours
  - `GET /api/admin/audit-logs` - Consulter logs
- **Sécurité**: Nécessite rôle admin

#### `utils/logger.js` 📝 LOGGING
- **Quoi**: Winston logger centralisé
- **Utilisé par**: Tout le code pour logger
- **Sortie**: `logs/app.log`, `logs/error.log`
- **À savoir**: Import avec `const logger = require('./utils/logger')`

### Base de données (`database/`)

#### `seed-rbac.sql`
- **Quoi**: Données initiales (rôles, permissions, admin)
- **Contient**:
  - 4 rôles (admin, instructor, student, visitor)
  - 40+ permissions
  - Associations rôle-permission
  - Utilisateur admin par défaut
- **À exécuter**: `mysql < seed-rbac.sql` après schéma

### Documentation

#### `README.md` 📖
- **Quoi**: Guide complet d'utilisation
- **Pour**: Tout développeur utilisant le backend
- **Sections**: Install, API endpoints, configuration, déploiement

#### `QUICKSTART.md` ⚡
- **Quoi**: Démarrage en 5 minutes
- **Pour**: Démarrer rapidement sans configuration complexe
- **Contient**: Instructions pas à pas

#### `ARCHITECTURE.md` 🏗️
- **Quoi**: Diagrammes et explications techniques
- **Pour**: Comprendre comment ça marche
- **Diagrammes**: Flux auth, RBAC, déploiement

#### `CHECKLIST.md` ✅
- **Quoi**: Checklist validée étape par étape
- **Pour**: Installation initialecomplet et validation

#### `PROJECT_SUMMARY.md` 📋
- **Quoi**: Résumé de tout ce qui a été créé
- **Pour**: Vue d'ensemble du projet

---

## 🚀 Workflows courants

### Démarrer le serveur

```bash
cd C:\xampp\htdocs\E-DAARA\backend
npm run dev              # Développement
# ou
npm start                # Production
```

### Ajouter une nouvelle route

1. Créer un fichier dans `src/routes/monmodule.js`
2. Utiliser comme template: `src/routes/courses.js`
3. Ajouter dans `src/app.js`: `app.use('/api/monmodule', require('./routes/monmodule'))`
4. Redémarrer le serveur

### Écrire une requête BD

```javascript
const { query, queryOne } = require('../config/database');

// Récupérer tous les résultats
const users = await query('SELECT * FROM users WHERE status = ?', ['active']);

// Récupérer une ligne
const user = await queryOne('SELECT * FROM users WHERE id = ?', [1]);
```

### Vérifier un rôle/permission

```javascript
const { requireRole, requirePermission } = require('../middlewares/rbac');

// Routes avec protection
router.post('/delete', 
  verifyJWT, 
  loadRBACContext,
  requireRole('admin'),              // Nécessite rôle admin
  async (req, res) => { ... }
);

router.post('/moderate', 
  verifyJWT, 
  loadRBACContext,
  requirePermission('courses:validate'),  // Nécessite permission
  async (req, res) => { ... }
);
```

### Enregistrer une action (audit)

```javascript
const { logAudit } = require('../middlewares/rbac');

await logAudit(
  req.user.id,                    // Qui
  'DELETE_COURSE',                // Quoi
  'courses',                       // Ressource
  courseId,                        // ID ressource
  req.ip,                          // D'où
  req.headers['user-agent']        // Quel navigateur
);
```

### Ajouter une dépendance

```bash
npm install package-name           # Production
npm install --save-dev package-name # Dev seulement
npm list                            # Vérifier installées
```

---

## 🔍 Rechercher dans le projet

### Chercher une fonction/classe

```bash
# Dans VS Code: Ctrl+Shift+F
# Chercher: "function loginUser"
# Résultat: Affiche toutes les occurrences
```

### Chercher un endpoint

```bash
# Dans VS Code: Ctrl+F, puis chercher
# Exemple: "GET /api/users"
# Fichiers: src/routes/*.js
```

### Chercher une table BD

```bash
# Dans VS Code: Ctrl+F
# Chercher: "INSERT INTO users"
# Fichier: database/seed-rbac.sql
```

---

## 📞 Besoin d'aide?

### Erreur?

1. Vérifier `.env` - variables correctes?
2. Vérifier MySQL - serveur démarre?
3. Vérifier logs - `logs/error.log`?
4. Chercher erreur dans: README.md > Troubleshooting

### Question technique?

1. Consulter code commenté (JSDoc)
2. Lire README.md section appropriée
3. Consulter ARCHITECTURE.md pour flux
4. Chercher dans les fichiers du projet

### Aller plus loin?

1. Implémenter modules manquants
2. Ajouter tests automatisés
3. Configurer OAuth 2.0
4. Déployer avec Docker

---

## ✅ Fichiers à créer / personnaliser

Les fichiers suivants **DOIVENT** être créés/modifiés avant démarrage:

- [ ] `.env` - Copier de `.env.example` et remplir vos valeurs
- [ ] `database/seed-rbac.sql` - Peut être adapté pour plus de rôles
- [ ] `package.json` - Modifier si vous ajoutez des scripts perso

Les fichiers suivants peuvent être créés pour extension:

- [ ] `src/controllers/coursesController.js` - Logique métier des cours
- [ ] `src/utils/validation.js` - Schémas Joi pour validations
- [ ] `src/__tests__/auth.test.js` - Tests unitaires
- [ ] `.github/workflows/ci.yml` - CI/CD

---

**Dernière mise à jour**: Mai 2025
**Statut**: ✅ Prêt pour développement
**Version**: 1.0.0
