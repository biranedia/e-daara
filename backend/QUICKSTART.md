# 🚀 Quick Start — E-DAARA Backend

Commençons en 5 minutes!

## Étape 1: Préparer la base de données

```bash
# S'assurer que MySQL fonctionne
# Dans phpMyAdmin ou MySQL CLI:

mysql -u root -p

CREATE DATABASE edaara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edaara_db;

# Importer le schéma et les données
SOURCE C:\xampp\htdocs\E-DAARA\database\edaara_schema_complet.sql;
SOURCE C:\xampp\htdocs\E-DAARA\backend\database\seed-rbac.sql;

# Vérifier les tables
SHOW TABLES;

# Quitter
EXIT;
```

## Étape 2: Configurer l'environnement

```bash
cd C:\xampp\htdocs\E-DAARA\backend

# Copier le fichier d'exemple
copy .env.example .env

# Éditer .env avec vos paramètres (Notepad++, VS Code, etc.)
# Éléments essentiels:
# - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
# - JWT_SECRET (générer une chaîne aléatoire sécurisée)
```

Contenu `.env` minimal:

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

## Étape 3: Installer les dépendances

```bash
npm install
```

## Étape 4: Lancer le serveur

### Mode développement (auto-reload):

```bash
npm run dev
```

### Mode production:

```bash
npm start
```

✅ Le serveur démarre sur: **http://localhost:3000**

## Étape 5: Tester l'API

### Option A: Swagger UI (navigateur)

```
http://localhost:3000/api-docs
```

### Option B: Curl (terminal)

```bash
# S'inscrire
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Diao\",\"prenom\":\"Birane\",\"email\":\"birane@edaara.sn\",\"password\":\"SecurePass123!\"}"

# Connexion
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"birane@edaara.sn\",\"password\":\"SecurePass123!\"}"

# Récupérer le token et consulter le profil
curl -X GET http://localhost:3000/api/users/profile ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Option C: Postman

1. Importer les endpoints depuis Swagger: `http://localhost:3000/api-docs`
2. Utiliser l'onglet **Auth** pour ajouter le Bearer Token
3. Tester les routes

## Utilisateur admin par défaut

```
Email: admin@edaara.sn
Mot de passe: AdminPass123!
```

**À CHANGER EN PRODUCTION!**

## Vérifier la santé du serveur

```bash
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

## Où trouver quoi

| Besoin | Chemin |
|--------|--------|
| **Documentation API complète** | http://localhost:3000/api-docs |
| **Guide d'installation détaillé** | `./README.md` |
| **Schéma base de données** | `../database/edaara_schema_complet.sql` |
| **Logs d'application** | `./logs/app.log` |
| **Logs d'erreurs** | `./logs/error.log` |
| **Configuration** | `./.env` |

## Dépannage rapide

### ❌ "Connection refused" (MySQL)

```bash
# Vérifier que MySQL fonctionne
# XAMPP: démarrer MySQL via Control Panel

# Vérifier les paramètres .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
```

### ❌ "JWT_SECRET not defined"

```bash
# S'assurer que .env contient JWT_SECRET
JWT_SECRET=your_secret_key_here_minimum_32_chars
```

### ❌ "Port 3000 déjà utilisé"

```bash
# Changer le port dans .env
PORT=3001

# Ou trouver le processus (Windows PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
```

## Prochaines étapes

1. ✅ Lancer le serveur (fait!)
2. 📖 Lire `README.md` pour plus de détails
3. 🔐 Configurer OAuth Google/Facebook (optionnel)
4. 🗄️ Personnaliser la base de données pour vos besoins
5. 🚀 Déployer sur votre serveur (voir Docker/Nginx)

---

**Besoin d'aide?** Consulter le [README.md](./README.md) complet ou les commentaires du code source.

Bonne développement avec E-DAARA! 🎓
