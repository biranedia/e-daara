# 🧪 Guide de test des endpoints E-DAARA

> Testez tous les endpoints de votre API E-DAARA

## 📋 Prérequis

- ✅ Serveur en cours d'exécution: `npm run dev`
- ✅ Base de données prête avec données RBAC
- ✅ Swagger UI accessible: http://localhost:3000/api-docs

---

## 🌍 Endpoints à tester

### Phase 1️⃣: Tests de base (sans authentification)

#### 1.1 - Health Check

**Endpoint**: `GET /health`

```bash
curl http://localhost:3000/health
```

**Réponse attendue** (200 OK):
```json
{
  "status": "OK",
  "timestamp": "2025-05-17T16:41:23.123Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

#### 1.2 - API Version

**Endpoint**: `GET /api/version`

```bash
curl http://localhost:3000/api/version
```

**Réponse attendue** (200 OK):
```json
{
  "version": "1.0.0",
  "name": "E-DAARA Backend",
  "status": "operational"
}
```

---

#### 1.3 - Catalogue public - Lister les cours

**Endpoint**: `GET /api/public/courses`

```bash
curl http://localhost:3000/api/public/courses
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "courses": [],
    "total": 0,
    "page": 1,
    "limit": 10
  }
}
```

*(Vide car aucun cours n'est encore créé)*

---

### Phase 2️⃣: Authentification

#### 2.1 - Inscription (Register)

**Endpoint**: `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Diallo",
    "prenom": "Amadou",
    "email": "amadou@edaara.sn",
    "password": "SecurePass123!"
  }'
```

**Réponse attendue** (201 Created):
```json
{
  "success": true,
  "data": {
    "userId": 2,
    "email": "amadou@edaara.sn",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "email": "amadou@edaara.sn",
      "nom": "Diallo",
      "prenom": "Amadou",
      "roles": ["student"]
    }
  }
}
```

**⚠️ Erreur si email déjà utilisé** (409):
```json
{
  "success": false,
  "message": "Un utilisateur avec cet email existe déjà",
  "code": "USER_EXISTS"
}
```

---

#### 2.2 - Connexion (Login)

**Endpoint**: `POST /api/auth/login`

**Avec admin**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edaara.sn",
    "password": "AdminPass123!"
  }'
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

**💾 Sauvegardez les tokens pour les tests suivants!**

---

#### 2.3 - Refresh Token

**Endpoint**: `POST /api/auth/refresh-token`

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Phase 3️⃣: Routes protégées (Nécessite JWT)

#### 3.1 - Récupérer le profil

**Endpoint**: `GET /api/users/profile`

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@edaara.sn",
      "nom": "Admin",
      "prenom": "E-DAARA",
      "avatar": null,
      "bio": null,
      "language": "fr",
      "status": "active",
      "roles": ["admin"],
      "permissions": ["auth:*", "users:*", "courses:*", "admin:*", ...]
    }
  }
}
```

---

#### 3.2 - Modifier le profil

**Endpoint**: `PUT /api/users/profile`

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Diallo",
    "prenom": "Amadou",
    "bio": "Développeur passionné par l'\''éducation",
    "language": "fr"
  }'
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "amadou@edaara.sn",
      "nom": "Diallo",
      "prenom": "Amadou",
      "bio": "Développeur passionné par l'éducation",
      "language": "fr"
    }
  }
}
```

---

#### 3.3 - Changer le mot de passe

**Endpoint**: `POST /api/users/change-password`

```bash
curl -X POST http://localhost:3000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "AdminPass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "message": "Mot de passe changé avec succès"
}
```

---

### Phase 4️⃣: Admin - Gestion utilisateurs

#### 4.1 - Lister tous les utilisateurs (Admin)

**Endpoint**: `GET /api/admin/users`

```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@edaara.sn",
        "nom": "Admin",
        "prenom": "E-DAARA",
        "status": "active",
        "roles": ["admin"],
        "created_at": "2025-05-17T10:00:00Z"
      },
      {
        "id": 2,
        "email": "amadou@edaara.sn",
        "nom": "Diallo",
        "prenom": "Amadou",
        "status": "active",
        "roles": ["student"],
        "created_at": "2025-05-17T16:41:23Z"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

---

#### 4.2 - Changer le statut d'un utilisateur

**Endpoint**: `PUT /api/admin/users/:id/status`

```bash
curl -X PUT http://localhost:3000/api/admin/users/2/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive",
    "reason": "Utilisateur inactif depuis 6 mois"
  }'
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "amadou@edaara.sn",
      "status": "inactive",
      "updated_at": "2025-05-17T16:45:00Z"
    }
  }
}
```

---

#### 4.3 - Tableau de bord admin

**Endpoint**: `GET /api/admin/dashboard`

```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_users": 2,
      "active_users": 1,
      "total_courses": 0,
      "total_enrollments": 0,
      "total_assessments": 0,
      "users_by_role": {
        "admin": 1,
        "instructor": 0,
        "student": 1,
        "visitor": 0
      },
      "system_health": {
        "database": "connected",
        "memory_usage": "45%",
        "uptime_seconds": 300
      }
    }
  }
}
```

---

#### 4.4 - Logs d'audit

**Endpoint**: `GET /api/admin/audit-logs`

```bash
curl -X GET http://localhost:3000/api/admin/audit-logs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "user_id": 1,
        "action": "LOGIN",
        "resource": "auth",
        "resource_id": null,
        "ip_address": "127.0.0.1",
        "user_agent": "Mozilla/5.0...",
        "timestamp": "2025-05-17T16:41:23Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### Phase 5️⃣: Gestion des cours (Formateur)

#### 5.1 - Créer un cours

**Endpoint**: `POST /api/courses`

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction à JavaScript",
    "description": "Cours complet de JavaScript pour débutants",
    "category_id": 1,
    "level": "beginner",
    "price": 0,
    "language": "fr",
    "status": "draft"
  }'
```

**Réponse attendue** (201 Created):
```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "title": "Introduction à JavaScript",
      "description": "Cours complet de JavaScript pour débutants",
      "status": "draft",
      "instructor_id": 3,
      "created_at": "2025-05-17T16:45:00Z"
    }
  }
}
```

---

#### 5.2 - Lister mes cours

**Endpoint**: `GET /api/courses`

```bash
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN_HERE"
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "Introduction à JavaScript",
        "status": "draft",
        "instructor_id": 3,
        "students_enrolled": 0,
        "created_at": "2025-05-17T16:45:00Z"
      }
    ],
    "total": 1
  }
}
```

---

#### 5.3 - Récupérer un cours

**Endpoint**: `GET /api/courses/:id`

```bash
curl -X GET http://localhost:3000/api/courses/1 \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN_HERE"
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "title": "Introduction à JavaScript",
      "description": "Cours complet de JavaScript pour débutants",
      "instructor_id": 3,
      "category_id": 1,
      "level": "beginner",
      "price": 0,
      "language": "fr",
      "status": "draft",
      "created_at": "2025-05-17T16:45:00Z",
      "sections": []
    }
  }
}
```

---

#### 5.4 - Modifier un cours

**Endpoint**: `PUT /api/courses/:id`

```bash
curl -X PUT http://localhost:3000/api/courses/1 \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction complète à JavaScript",
    "description": "Cours complet de JavaScript pour débutants et intermédiaires"
  }'
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "title": "Introduction complète à JavaScript",
      "description": "Cours complet de JavaScript pour débutants et intermédiaires",
      "updated_at": "2025-05-17T16:50:00Z"
    }
  }
}
```

---

#### 5.5 - Supprimer un cours

**Endpoint**: `DELETE /api/courses/:id`

```bash
curl -X DELETE http://localhost:3000/api/courses/1 \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN_HERE"
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "message": "Cours supprimé avec succès"
}
```

---

### Phase 6️⃣: Admin - Validation des cours

#### 6.1 - Lister les cours en attente

**Endpoint**: `GET /api/admin/courses/pending`

```bash
curl -X GET http://localhost:3000/api/admin/courses/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "Introduction à JavaScript",
        "instructor": "Amadou Diallo",
        "status": "pending",
        "submitted_at": "2025-05-17T16:45:00Z"
      }
    ],
    "total": 1
  }
}
```

---

#### 6.2 - Valider un cours

**Endpoint**: `POST /api/admin/courses/:id/validate`

```bash
curl -X POST http://localhost:3000/api/admin/courses/1/validate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "feedback": "Excellent cours, approuvé pour publication"
  }'
```

**Réponse attendue** (200 OK):
```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "status": "published",
      "approved_at": "2025-05-17T16:55:00Z"
    }
  }
}
```

---

## 📋 Tableau de synthèse des tests

| # | Endpoint | Méthode | Auth | Statut | Notes |
|---|----------|---------|------|--------|-------|
| 1.1 | /health | GET | ❌ | ✅ Public | Test basique |
| 1.2 | /api/version | GET | ❌ | ✅ Public | Info serveur |
| 1.3 | /api/public/courses | GET | ❌ | ✅ Public | Catalogue |
| 2.1 | /api/auth/register | POST | ❌ | ✅ Public | Inscription |
| 2.2 | /api/auth/login | POST | ❌ | ✅ Public | Connexion |
| 2.3 | /api/auth/refresh-token | POST | ❌ | ✅ Public | Renouveler token |
| 3.1 | /api/users/profile | GET | ✅ JWT | ✅ Protected | Profil utilisateur |
| 3.2 | /api/users/profile | PUT | ✅ JWT | ✅ Protected | Modifier profil |
| 3.3 | /api/users/change-password | POST | ✅ JWT | ✅ Protected | Changer mot de passe |
| 4.1 | /api/admin/users | GET | ✅ Admin | ✅ Protected | Lister utilisateurs |
| 4.2 | /api/admin/users/:id/status | PUT | ✅ Admin | ✅ Protected | Changer statut |
| 4.3 | /api/admin/dashboard | GET | ✅ Admin | ✅ Protected | Stats admin |
| 4.4 | /api/admin/audit-logs | GET | ✅ Admin | ✅ Protected | Logs d'audit |
| 5.1 | /api/courses | POST | ✅ Instructor | ✅ Protected | Créer cours |
| 5.2 | /api/courses | GET | ✅ JWT | ✅ Protected | Lister mes cours |
| 5.3 | /api/courses/:id | GET | ✅ JWT | ✅ Protected | Détails cours |
| 5.4 | /api/courses/:id | PUT | ✅ Instructor | ✅ Protected | Modifier cours |
| 5.5 | /api/courses/:id | DELETE | ✅ Instructor | ✅ Protected | Supprimer cours |
| 6.1 | /api/admin/courses/pending | GET | ✅ Admin | ✅ Protected | Cours en attente |
| 6.2 | /api/admin/courses/:id/validate | POST | ✅ Admin | ✅ Protected | Valider cours |

---

## 🛠️ Outils de test recommandés

### Option 1: Swagger UI (Plus facile)
```
http://localhost:3000/api-docs
```
- Interface graphique
- "Try it out" pour chaque endpoint
- Génération automatique des commandes

### Option 2: cURL (Ligne de commande)
```bash
# Inclus dans Windows 10+ et tous les systèmes
curl -X GET http://localhost:3000/health
```

### Option 3: Postman (Puissant)
1. Télécharger: https://www.postman.com/downloads/
2. Importer collection Swagger
3. Tester avec interface graphique
4. Sauvegarder les résultats

### Option 4: VS Code REST Client
```bash
npm install -g rest-client
# Créer file.rest avec les commandes
# Cliquer "Send Request" directement
```

---

## ✅ Plan d'action pour les tests

### 🟢 Étape 1: Tests basiques (5 min)
- [ ] Tester 1.1: Health Check
- [ ] Tester 1.2: Version
- [ ] Tester 1.3: Cours publics (vide)

### 🟡 Étape 2: Authentification (10 min)
- [ ] Tester 2.1: S'inscrire
- [ ] Tester 2.2: Se connecter (admin)
- [ ] Tester 2.3: Refresh token
- [ ] ⚠️ Sauvegardez les tokens!

### 🟠 Étape 3: Routes protégées (10 min)
- [ ] Tester 3.1: Récupérer profil
- [ ] Tester 3.2: Modifier profil
- [ ] Tester 3.3: Changer mot de passe

### 🔵 Étape 4: Admin (10 min)
- [ ] Tester 4.1: Lister utilisateurs
- [ ] Tester 4.2: Changer statut
- [ ] Tester 4.3: Dashboard
- [ ] Tester 4.4: Audit logs

### 🟣 Étape 5: Cours (15 min)
- [ ] Inscrivez un formateur (rôle instructor)
- [ ] Tester 5.1: Créer cours
- [ ] Tester 5.2: Lister mes cours
- [ ] Tester 5.3: Récupérer détails
- [ ] Tester 5.4: Modifier cours
- [ ] Tester 5.5: Supprimer cours

### 🟤 Étape 6: Validation (5 min)
- [ ] Tester 6.1: Cours en attente
- [ ] Tester 6.2: Valider cours

**Temps total**: ~55 minutes pour tous les tests

---

## 🆘 Dépannage des tests

| Erreur | Cause | Solution |
|--------|-------|----------|
| 404 Not Found | Endpoint n'existe pas | Vérifier URL exacte |
| 401 Unauthorized | Token absent/invalide | Vérifier Bearer token |
| 403 Forbidden | Permission insuffisante | Vérifier rôle utilisateur |
| 500 Server Error | Erreur serveur | Voir logs `logs/error.log` |
| CORS error | Domaine non autorisé | Vérifier `CORS_ORIGIN` |
| Connection refused | Serveur arrêté | `npm run dev` |

---

## 📊 Métriques de réussite

Tous les tests passés ✅:
- ✅ 13 endpoints publics/protégés fonctionnent
- ✅ JWT authentification active
- ✅ RBAC appliqué correctement
- ✅ Logs d'audit générés
- ✅ Base de données synchronisée

**Résultat**: Backend E-DAARA prêt pour production! 🚀

---

**Dernière mise à jour**: Mai 2026
**Version**: 1.0.0
