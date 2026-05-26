# 🏗️ Architecture E-DAARA Backend

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Angular SPA)                       │
│              http://localhost:4200 (développement)              │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP REST + JWT Token
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY                          │
│               (Reverse Proxy + Load Balancer)                   │
│                    Port 80/443 (Production)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │ http://localhost:3000
                     │
┌────────────────────▼──────────────────────────────────────────┐
│                  E-DAARA BACKEND API                            │
│                 (Express.js + Node.js)                          │
│                   Port 3000                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │             Middlewares (Stack)                         │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ 1. Helmet         - Headers de sécurité HTTP           │ │
│  │ 2. CORS           - Partage cross-origin               │ │
│  │ 3. Rate Limiting  - Protection abus (100 req/15min)   │ │
│  │ 4. Parser JSON    - Body JSON                          │ │
│  │ 5. Morgan         - Logging requêtes HTTP             │ │
│  │ 6. Audit Logger   - Traçabilité actions               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                         │                                      │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │            Routes & Contrôleurs                        │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ /auth            - Authentification JWT/OAuth          │ │
│  │ /public          - Catalogue (non authentifié)         │ │
│  │ /users           - Profil utilisateur                  │ │
│  │ /courses         - Gestion cours (CRUD)               │ │
│  │ /paths           - Parcours d'apprentissage           │ │
│  │ /enrollments     - Inscriptions                       │ │
│  │ /assessments     - Quiz & évaluations                │ │
│  │ /lessons         - Leçons                            │ │
│  │ /dashboard       - Tableau de bord                   │ │
│  │ /admin           - Administration                    │ │
│  │ /api-docs        - Documentation Swagger             │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                      │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │     Middlewares de sécurité (Auth + RBAC)             │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ • verifyJWT      - Vérifier token JWT valide          │ │
│  │ • optionalJWT    - JWT optionnel (routes publiques)   │ │
│  │ • loadRBACContext- Charger rôles & permissions        │ │
│  │ • requireRole()  - Vérifier rôle spécifique          │ │
│  │ • requirePerm()  - Vérifier permission atomique      │ │
│  │ • auditLogger    - Enregistrer actions (logs)        │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                      │
│              ┌──────────┴────────────┐                         │
│              ▼                       ▼                         │
│         MySQL 8.0          Services/Utilities                 │
│         (Port 3306)        - Logger Winston                   │
│                            - Crypto/JWT                       │
│                            - Bcrypt                           │
│                            - Mailer (SMTP)                    │
│                            - MinIO (storage)                  │
└───────────────────────────────────────────────────────────────┘
```

---

## Flux d'authentification

### 1️⃣ Inscription

```
Client                          API                         Database
  │                             │                              │
  ├─ POST /auth/register ───────>│                              │
  │   {email, password, ...}     │                              │
  │                              ├─ Valider email unique ───────>│ CHECK
  │                              │                              │
  │                              ├─ Hasher password (bcrypt)    │
  │                              │                              │
  │                              ├─ INSERT user ────────────────>│
  │                              │                              │
  │                              ├─ INSERT learner_profile ─────>│
  │                              │                              │
  │                              ├─ INSERT user_role ───────────>│
  │                              │                              │
  │                              ├─ Générer JWT tokens          │
  │                              │                              │
  │                              ├─ INSERT refresh_token ───────>│
  │                              │                              │
  │<─ 201 accessToken ────────────│                              │
  │     refreshToken             │                              │
  │                              │                              │

Réponse:
{
  "userId": 1,
  "email": "user@edaara.sn",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900
}
```

### 2️⃣ Connexion

```
Client                          API                         Database
  │                             │                              │
  ├─ POST /auth/login ──────────>│                              │
  │   {email, password}          │                              │
  │                              ├─ SELECT user ────────────────>│
  │                              │<─ user {id, password_hash}    │
  │                              │                              │
  │                              ├─ Compare passwords (bcrypt)  │
  │                              │   ✓ Valide                   │
  │                              │                              │
  │                              ├─ UPDATE last_login_at ───────>│
  │                              │                              │
  │                              ├─ Générer tokens JWT          │
  │                              │                              │
  │                              ├─ INSERT refresh_token ───────>│
  │                              │                              │
  │<─ 200 accessToken ────────────│                              │
  │     refreshToken             │                              │
  │     (expiresIn: 900)         │                              │
  │                              │                              │
```

### 3️⃣ Requête protégée (avec JWT)

```
Client                         API                         Database
  │                            │                              │
  ├─ GET /api/users/profile    │                              │
  │   Authorization: Bearer    │                              │
  │   {accessToken}            │                              │
  │                            │                              │
  │                            ├─ verifyJWT Middleware        │
  │                            │  ├─ Décoder token            │
  │                            │  ├─ Vérifier signature       │
  │                            │  ├─ Vérifier expiration      │
  │                            │  └─ Extraire userId          │
  │                            │                              │
  │                            ├─ loadRBACContext Middleware  │
  │                            │  ├─ SELECT roles ────────────>│
  │                            │  │<─ ['student']             │
  │                            │  │                           │
  │                            │  ├─ SELECT permissions ──────>│
  │                            │  │<─ [...]                   │
  │                            │  └─ req.user enrichi         │
  │                            │                              │
  │                            ├─ Contrôleur (logique métier) │
  │                            │                              │
  │                            ├─ SELECT user data ───────────>│
  │                            │<─ {id, email, ...}           │
  │                            │                              │
  │<─ 200 {user profile} ──────│                              │
  │                            │                              │
```

### 4️⃣ Renouvellement token (Refresh)

```
Client                          API                         Database
  │                             │                              │
  ├─ POST /auth/refresh-token   │                              │
  │   {refreshToken}            │                              │
  │                             │                              │
  │                             ├─ Vérifier refresh token      │
  │                             │  ├─ Décoder JWT             │
  │                             │  ├─ Vérifier type='refresh'  │
  │                             │  └─ Vérifier userId          │
  │                             │                              │
  │                             ├─ SELECT user ────────────────>│
  │                             │<─ {id, status}               │
  │                             │                              │
  │                             ├─ Générer nouvel accessToken  │
  │                             │                              │
  │<─ 200 {accessToken} ────────│                              │
  │     {expiresIn}             │                              │
  │                             │                              │
```

---

## Flux RBAC (Role-Based Access Control)

```
User Authentication
        │
        ▼
    Token JWT
        │
        ▼
   verifyJWT() ─────► Décoder et valider token
        │
        ▼
  loadRBACContext()
        │
        ├─► SELECT user_role ──────► Récupérer rôles
        │
        ├─► SELECT role_permission ► Récupérer permissions
        │
        └─► Attacher à req.user
            {id, email, roles: ['student'], permissions: [...]}
        │
        ▼
  Middleware de route (optionnel)
        │
        ├─ requireRole('instructor') ──► if (req.user.roles.includes('instructor'))
        │                                  ✓ Continuer
        │                                  ✗ 403 Forbidden
        │
        ├─ requirePermission('courses:create') ──► if (req.user.permissions.includes(...))
        │                                           ✓ Continuer
        │                                           ✗ 403 Forbidden
        │
        ▼
  Exécuter contrôleur
        │
        ├─► Logique métier
        └─► auditLogger() ──► INSERT audit_logs
            {user_id, action, resource, ip_address, created_at}
        │
        ▼
  Réponse client
```

---

## Structure des données JWT

### Access Token (15 minutes)

```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": 42,
  "type": "access",
  "iat": 1715961600,
  "exp": 1715962500
}

Signature: HMAC-SHA256(header + payload, JWT_SECRET)
```

### Refresh Token (30 jours)

```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": 42,
  "type": "refresh",
  "iat": 1715961600,
  "exp": 1718553600
}

Stockage BD:
- token_hash (SHA-256)
- ip_address (IP du client)
- user_agent (navigateur)
- revoked (boolean)
- expires_at (timestamp)
```

---

## Tables de base de données clés

### Users (Authentification)

```
users
├── id (PK)
├── email (UNIQUE)
├── password (bcrypt hash)
├── provider ('local', 'google', 'facebook')
├── provider_id (ID OAuth)
├── status ('active', 'inactive', 'suspended')
├── roles (M:N via user_role)
├── permissions (M:N via role_permission)
└── timestamps (created_at, updated_at, deleted_at)
```

### RBAC Relations

```
roles <─────────> permissions
  ▲                    ▲
  │ (M:N)              │ (M:N)
  │ via               │ via
  │ user_role         │ role_permission
  │                   │
  └── users           (permissions)
       │
       └── learner_profiles
           instructor_profiles
```

### Audit Logs (Souveraineté)

```
audit_logs
├── id
├── user_id (FK → users)
├── action (ex: 'CREATE_COURSE')
├── resource (ex: 'courses')
├── resource_id
├── ip_address
├── user_agent
└── created_at

Exemple:
INSERT INTO audit_logs
VALUES (1, 42, 'CREATE_COURSE', 'courses', 15, '192.168.1.100', 'Mozilla...', NOW())
```

---

## Cycle de vie d'une requête

```
1. CLIENT REQUEST
   ├─ POST /api/courses
   ├─ Authorization: Bearer eyJhbGc...
   └─ Body: {titre: "Python 101"}

2. NGINX (Reverse Proxy)
   ├─ SSL/TLS termination
   ├─ Rate limiting check
   └─ Forward to Express

3. EXPRESS MIDDLEWARES (ordre)
   ├─ Helmet (security headers)
   ├─ CORS (cross-origin check)
   ├─ Rate Limit (100 req/15min)
   ├─ JSON Parser (body parsing)
   ├─ Morgan (HTTP logging)
   └─ Audit Logger

4. ROUTE MATCHING
   ├─ Match POST /api/courses
   └─ Find coursesRouter

5. SECURITY MIDDLEWARES
   ├─ verifyJWT (check token)
   ├─ loadRBACContext (load roles/perms)
   └─ requireRole('instructor') (check access)

6. CONTROLLER LOGIC
   ├─ Validate input (Joi schema)
   ├─ Query database
   ├─ Business logic
   └─ Format response

7. AUDIT LOGGING
   ├─ INSERT INTO audit_logs
   └─ record: {user_id, action, ip, timestamp}

8. RESPONSE
   ├─ Set status code
   ├─ Set headers
   ├─ Send JSON
   └─ Log in Winston

9. CLIENT RECEIVES
   └─ Response with data or error
```

---

## Sécurité en couches (Defense in Depth)

```
┌─────────────────────────────────────────┐
│ Layer 1: TRANSPORT                      │
│ - HTTPS/TLS 1.2+                       │
│ - Certificate pinning (optionnel)       │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│ Layer 2: NETWORK (Nginx)                │
│ - Rate limiting                         │
│ - IP whitelisting (optionnel)          │
│ - Firewall rules                        │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│ Layer 3: APPLICATION (Express)          │
│ - CORS validation                       │
│ - CSRF tokens (optionnel)              │
│ - Input validation (Joi)                │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│ Layer 4: AUTHENTICATION                 │
│ - JWT verification                      │
│ - Token expiration (15 min)             │
│ - Refresh token rotation                │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│ Layer 5: AUTHORIZATION (RBAC)           │
│ - Role checking                         │
│ - Permission verification               │
│ - Resource ownership check              │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│ Layer 6: DATABASE                       │
│ - Parameterized queries (SQL injection) │
│ - Password hashing (bcrypt)             │
│ - Encryption at rest (optionnel)       │
└─────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│ Layer 7: AUDIT & LOGGING                │
│ - Audit trail (audit_logs)              │
│ - Error logging (Winston)               │
│ - Access logs (Morgan)                  │
└─────────────────────────────────────────┘
```

---

## Diagramme de déploiement

```
PRODUCTION ENVIRONMENT
┌─────────────────────────────────────────────────────────┐
│ Serveur africain (ex: IPG/ISTI Dakar)                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Docker Container 1: MySQL 8.0                  │  │
│  │ - Port: 3306 (internal only)                   │  │
│  │ - Volume: /var/lib/mysql → persistent storage │  │
│  │ - Backup: daily mysqldump                      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Docker Container 2-4: API Nodes (replicas)     │  │
│  │ - Port: 3000, 3001, 3002                       │  │
│  │ - CPU: 1 core each                             │  │
│  │ - RAM: 512 MB each                             │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Docker Container 5: Nginx                      │  │
│  │ - Port: 80 → 3000 (HTTP redirect to HTTPS)    │  │
│  │ - Port: 443 → 3000-3002 (load balancer)       │  │
│  │ - SSL/TLS termination                          │  │
│  │ - Rate limiting                                │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ MinIO Storage (S3-compatible)                  │  │
│  │ - Vidéos, PDFs, images                         │  │
│  │ - Local storage (souveraineté)                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Monitoring (optionnel)                         │  │
│  │ - Prometheus (metrics)                         │  │
│  │ - Grafana (dashboards)                         │  │
│  │ - Loki (log aggregation)                       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

External Services (minimal):
- Google OAuth (authentication only)
- Facebook OAuth (authentication only)
- SMTP (email notifications)

NO DATA STORED with:
- AWS, Azure, Google Cloud
- Third-party CDNs
- External analytics
```

---

## Performance & Scalabilité

### Optimisations implémentées

```
✅ Connection pooling (MySQL) - 20 connexions max
✅ Gzip compression (Nginx)
✅ HTTP caching headers
✅ Database indexing (created_at, status, user_id)
✅ Lazy loading (pagination)
✅ Async/await (non-blocking I/O)
✅ Rate limiting (100 req/15min)
✅ Health checks (containers)
```

### Points de scalabilité

```
1. Horizontal scaling
   - Multiple API container replicas
   - Nginx load balancing
   - MySQL read replicas (optionnel)

2. Vertical scaling
   - Increase container CPU/RAM
   - Database optimization
   - Cache layer (Redis)

3. Database optimization
   - Query optimization
   - Connection pooling
   - Replication setup
```

---

**Fin de la documentation architecture**

Voir aussi:
- [README.md](./README.md) - Guide d'installation
- [QUICKSTART.md](./QUICKSTART.md) - Démarrage rapide
- Code source commenté avec JSDoc
