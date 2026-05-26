# ✅ Checklist de démarrage complet

> Suivez cette checklist dans l'ordre pour démarrer le backend E-DAARA.

## ✅ Phase 1: Préparation de l'environnement

- [ ] **MySQL en cours d'exécution**
  - XAMPP Control Panel → Start MySQL
  - Vérifier: `mysql -u root -p -e "SELECT 1"`

- [ ] **Node.js et npm installés**
  - Vérifier: `node --version` (16+)
  - Vérifier: `npm --version` (8+)

- [ ] **Répertoire du projet créé**
  - Chemin: `C:\xampp\htdocs\E-DAARA\backend`
  - Fichiers copiés

## ✅ Phase 2: Initialisation de la base de données

- [ ] **Créer la base de données**
  ```bash
  mysql -u root -p -e "CREATE DATABASE edaara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  ```

- [ ] **Importer le schéma complet**
  ```bash
  mysql -u root -p edaara_db < ../database/edaara_schema_complet.sql
  ```

- [ ] **Importer les données RBAC (rôles, permissions)**
  ```bash
  mysql -u root -p edaara_db < ./database/seed-rbac.sql
  ```

- [ ] **Vérifier les tables créées**
  ```bash
  mysql -u root -p edaara_db -e "SHOW TABLES;"
  # Doit afficher ~25 tables
  ```

- [ ] **Vérifier l'utilisateur admin**
  ```bash
  mysql -u root -p edaara_db -e "SELECT email, status FROM users WHERE email='admin@edaara.sn';"
  # Doit retourner: admin@edaara.sn | active
  ```

## ✅ Phase 3: Configuration du projet

- [ ] **Copier `.env.example` en `.env`**
  ```bash
  cd C:\xampp\htdocs\E-DAARA\backend
  copy .env.example .env
  ```

- [ ] **Éditer `.env` avec vos paramètres**
  - Ouvrir `.env` dans VS Code ou Notepad++
  
  Valeurs minimales requises:
  ```env
  NODE_ENV=development
  PORT=3000
  
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=edaara_db
  DB_USER=root
  DB_PASSWORD=
  
  JWT_SECRET=your_very_long_secret_key_at_least_32_characters_1234567890
  
  CORS_ORIGIN=http://localhost:4200,http://localhost:3000
  ```

- [ ] **Vérifier les variables d'environnement**
  - Aucune erreur lors du chargement de `.env`

## ✅ Phase 4: Installation des dépendances

- [ ] **Se placer dans le répertoire backend**
  ```bash
  cd C:\xampp\htdocs\E-DAARA\backend
  ```

- [ ] **Installer les dépendances npm**
  ```bash
  npm install
  ```
  - Doit télécharger ~200 packages
  - Durée: ~5-10 minutes selon connexion internet

- [ ] **Vérifier l'installation**
  ```bash
  npm list --depth=0
  # Doit montrer packages principaux (express, mysql2, jwt, bcryptjs, etc.)
  ```

- [ ] **Vérifier node_modules**
  - Le répertoire `node_modules/` doit contenir ~1000 fichiers

## ✅ Phase 5: Test de connectivité

- [ ] **Tester la connexion MySQL**
  ```bash
  npm test:db
  # Doit afficher "✓ Connexion MySQL réussie"
  ```

- [ ] **Vérifier que les tables existent**
  ```bash
  mysql -u root -p edaara_db -e "SELECT COUNT(*) FROM users;"
  # Doit retourner: 1 (l'utilisateur admin)
  ```

## ✅ Phase 6: Démarrage du serveur

- [ ] **Démarrer en mode développement**
  ```bash
  npm run dev
  ```

  Vous devez voir:
  ```
  ✓ Connexion MySQL réussie
  ✓ Serveur E-DAARA démarré sur http://0.0.0.0:3000
  ✓ Documentation Swagger: http://0.0.0.0:3000/api-docs
  ✓ Environnement: development
  ```

- [ ] **Le serveur reste actif**
  - Ne doit pas afficher d'erreurs
  - Peut accepter requêtes (pas de crash)

## ✅ Phase 7: Test des endpoints

### 7.1 - Health check

- [ ] **Tester la santé du serveur**
  ```bash
  # Dans un nouveau terminal
  curl http://localhost:3000/health
  ```
  
  Réponse attendue:
  ```json
  {
    "status": "OK",
    "timestamp": "2025-05-17T10:30:45.123Z",
    "environment": "development",
    "version": "1.0.0"
  }
  ```

### 7.2 - Inscription

- [ ] **Créer un nouveau compte**
  ```bash
  curl -X POST http://localhost:3000/api/auth/register ^
    -H "Content-Type: application/json" ^
    -d "{\"nom\":\"Test\",\"prenom\":\"User\",\"email\":\"test@edaara.sn\",\"password\":\"TestPass123!\"}"
  ```
  
  Réponse attendue:
  ```json
  {
    "success": true,
    "data": {
      "userId": 2,
      "email": "test@edaara.sn",
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
  ```

- [ ] **Vérifier l'utilisateur en BD**
  ```bash
  mysql -u root -p edaara_db -e "SELECT id, email, status FROM users WHERE email='test@edaara.sn';"
  # Doit retourner: 2 | test@edaara.sn | active
  ```

### 7.3 - Connexion

- [ ] **Se connecter avec les credentials**
  ```bash
  curl -X POST http://localhost:3000/api/auth/login ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"admin@edaara.sn\",\"password\":\"AdminPass123!\"}"
  ```
  
  Réponse attendue:
  ```json
  {
    "success": true,
    "data": {
      "userId": 1,
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
  ```

### 7.4 - Requête protégée

- [ ] **Récupérer le token de la réponse login**
  - Copier la valeur de `accessToken`

- [ ] **Consulter le profil avec le token**
  ```bash
  curl -X GET http://localhost:3000/api/users/profile ^
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```
  
  Réponse attendue:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "email": "admin@edaara.sn",
        "nom": "Admin",
        "prenom": "E-DAARA",
        "roles": ["admin"]
      }
    }
  }
  ```

## ✅ Phase 8: Documentation Swagger

- [ ] **Accéder à la documentation Swagger**
  ```
  http://localhost:3000/api-docs
  ```

- [ ] **Interface Swagger doit s'afficher**
  - Liste de tous les endpoints
  - Possibilité de "Try it out"

- [ ] **Tester un endpoint depuis Swagger**
  - Cliquer sur `/api/auth/login`
  - Cliquer sur "Try it out"
  - Remplir avec: `{"email":"admin@edaara.sn","password":"AdminPass123!"}`
  - Cliquer "Execute"
  - Vérifier la réponse 200

## ✅ Phase 9: Logs et monitoring

- [ ] **Vérifier les fichiers logs**
  ```bash
  # Afficher les 10 dernières lignes
  tail -10 logs/app.log
  tail -10 logs/error.log
  ```

- [ ] **Les logs doivent contenir**
  - Connexion MySQL réussie
  - Démarrage du serveur
  - Requêtes HTTP (si testées)
  - Aucune erreur critique

## ✅ Phase 10: Frontend (optionnel)

- [ ] **Configurer CORS dans `.env`**
  ```env
  CORS_ORIGIN=http://localhost:4200
  ```

- [ ] **Redémarrer le serveur**
  ```bash
  # Ctrl+C pour arrêter
  # npm run dev pour relancer
  ```

- [ ] **Frontend Angular peut maintenant se connecter**
  - Lancer le frontend sur http://localhost:4200
  - Les requêtes vers http://localhost:3000 seront autorisées

## ✅ Phase 11: Arrêt et redémarrage

- [ ] **Arrêter proprement le serveur**
  ```bash
  # Ctrl+C dans le terminal
  # Doit afficher: "✓ Serveur arrêté"
  ```

- [ ] **Redémarrer le serveur**
  ```bash
  npm run dev
  # Doit redémarrer sans erreurs
  ```

## ✅ Phase 12: Validation complète

- [ ] **Tous les endpoints testés**
  - ✓ GET /health
  - ✓ POST /api/auth/register
  - ✓ POST /api/auth/login
  - ✓ GET /api/users/profile
  - ✓ GET /api/public/courses

- [ ] **Bases de données validées**
  - ✓ Tables créées
  - ✓ Données RBAC chargées
  - ✓ Utilisateur admin existe

- [ ] **Logs correctement générés**
  - ✓ app.log existe
  - ✓ Pas d'erreurs critiques

- [ ] **Documentation Swagger accessible**
  - ✓ http://localhost:3000/api-docs
  - ✓ Tous les endpoints listés

## ✅ Phase 13: Déploiement (Production)

### 13.1 - Docker (optionnel)

- [ ] **Construire l'image Docker**
  ```bash
  docker build -t edaara-api:latest .
  ```

- [ ] **Lancer avec Docker Compose**
  ```bash
  docker-compose up -d
  ```

- [ ] **Vérifier les containers**
  ```bash
  docker-compose ps
  # Doit afficher: mysql running, api running, nginx running
  ```

### 13.2 - Nginx (production)

- [ ] **Configurer SSL/TLS**
  - Obtenir certificat Let's Encrypt
  - Placer dans `./ssl/`

- [ ] **Démarrer Nginx**
  ```bash
  docker-compose up nginx
  ```

- [ ] **Vérifier HTTPS**
  ```bash
  curl https://api.edaara.sn/health
  ```

## 🎯 Résumé de validation

Chaque phase complétée ✅ garantit:

| Phase | Validation | Status |
|-------|-----------|--------|
| 1 | Environnement prêt | ✓ Node, MySQL |
| 2 | BD créée | ✓ 25 tables |
| 3 | Config setup | ✓ .env exists |
| 4 | Dependencies | ✓ npm install ok |
| 5 | Connectivity | ✓ MySQL connected |
| 6 | Server running | ✓ http://localhost:3000 |
| 7 | API functional | ✓ Endpoints work |
| 8 | Documentation | ✓ Swagger accessible |
| 9 | Monitoring | ✓ Logs generated |
| 10 | Frontend ready | ✓ CORS configured |
| 11 | Restart works | ✓ Server restarts |
| 12 | Complete | ✓ All validated |
| 13 | Production | ✓ Docker ready |

## 🆘 Aide au dépannage

| Problème | Solution |
|----------|----------|
| MySQL refused | Vérifier MySQL en cours d'exécution, vérifier `DB_*` dans `.env` |
| Port 3000 utilisé | Changer `PORT` dans `.env` ou tuer processus |
| JWT errors | Vérifier `JWT_SECRET` ≥ 32 caractères |
| npm install fails | Vérifier internet, Node.js version, permissions |
| Connexion BD fails | Vérifier credentials, `edaara_db` existe, schéma importé |
| Swagger ne charge pas | Vérifier serveur en cours d'exécution, cache navigateur |

---

**🎉 Félicitations!** Si vous avez coché toutes les cases, votre backend E-DAARA est prêt! 

Prochaines étapes:
1. Implémenter les modules manquants
2. Écrire les tests automatisés
3. Configurer le frontend Angular
4. Déployer en production
