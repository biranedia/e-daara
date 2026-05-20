# E-DAARA — Frontend Angular

Interface utilisateur de la plateforme E-DAARA, construite avec **Angular 18 (standalone components + Signals)**, **Angular Material** et **TailwindCSS**.

Branchée sur le backend Node.js/Express situé dans `../backend` via `http://localhost:3000/api`.

---

## Stack technique

| Couche | Choix |
|---|---|
| Framework | Angular 18 LTS (standalone, signals, control flow `@if/@for`) |
| UI | Angular Material 18 + TailwindCSS 3 |
| Auth | JWT + Refresh token automatique via intercepteur HTTP |
| Sécurité routes | `authGuard` + `roleGuard(['admin'/'instructor'/'student'])` |
| État | Services + RxJS + Signals (pas de NgRx) |
| Formulaires | Reactive Forms uniquement |
| i18n | ngx-translate (à brancher) |
| Build | Angular CLI 18 (`@angular-devkit/build-angular:application`) |

---

## Démarrage rapide

### 1. Prérequis

- Node.js **>= 18.19** (recommandé : 20 LTS)
- npm **>= 10**
- Backend E-DAARA lancé sur `http://localhost:3000`

### 2. Ouvrir le projet dans VS Code

Depuis le dossier racine `E-DAARA/` :

```bash
code frontend
```

VS Code vous proposera automatiquement les extensions recommandées (Angular Language Service, Tailwind IntelliSense, Prettier, ESLint, Angular Essentials). Cliquez sur **Install All**.

### 3. Installer les dépendances

Dans le terminal intégré de VS Code (Ctrl+ù ou Ctrl+`) :

```bash
npm install
```

L'installation prend 2 à 4 minutes selon votre connexion.

### 4. Lancer le serveur de développement

```bash
npm start
```

Cela démarre :
- Le dev-server Angular sur `http://localhost:4200`
- Un **proxy** vers le backend : tout appel à `/api/...` est redirigé vers `http://localhost:3000/api/...` (voir `proxy.conf.json`), ce qui évite les problèmes CORS en dev.

Ouvrir [http://localhost:4200](http://localhost:4200) dans votre navigateur.

### 5. Build production

```bash
npm run build
```

Le résultat se trouve dans `dist/edaara/`. À déployer derrière un Nginx ou tout serveur de fichiers statiques.

---

## Arborescence

```
frontend/
├── public/                       Assets statiques publics
├── src/
│   ├── app/
│   │   ├── core/                 Singletons : services, interceptors, guards, models
│   │   │   ├── services/         ApiService, AuthService, TokenStorageService
│   │   │   ├── interceptors/     authInterceptor (JWT + refresh auto)
│   │   │   ├── guards/           authGuard, roleGuard
│   │   │   └── models/           User, AuthResponse, ApiResponse
│   │   ├── shared/               Composants/pipes/directives réutilisables
│   │   ├── layouts/              public, student, instructor, admin
│   │   ├── features/
│   │   │   ├── auth/             login, register, forgot, reset
│   │   │   ├── public/           home / catalogue
│   │   │   ├── student/          espace étudiant
│   │   │   ├── instructor/       espace formateur
│   │   │   ├── admin/            espace admin
│   │   │   ├── forum/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   ├── certificates/
│   │   │   └── profile/
│   │   ├── app.config.ts         Providers globaux (router, http, animations)
│   │   ├── app.routes.ts         Routes lazy-loaded
│   │   └── app.component.ts      Coquille (router-outlet)
│   ├── environments/             environment.ts / environment.prod.ts
│   ├── index.html
│   ├── main.ts                   bootstrapApplication standalone
│   └── styles.scss               Thème Material + Tailwind
├── angular.json
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── proxy.conf.json               Proxy /api → http://localhost:3000
├── tsconfig*.json
└── README.md
```

---

## Endpoints backend déjà câblés

Le `AuthService` est branché sur :

| Méthode | URL | Statut |
|---|---|---|
| POST | `/api/auth/register` | OK |
| POST | `/api/auth/login` | OK |
| POST | `/api/auth/refresh-token` | OK (auto via intercepteur) |
| POST | `/api/auth/logout` | OK |
| POST | `/api/auth/forgot-password` | OK |
| POST | `/api/auth/reset-password` | OK |
| GET  | `/api/users/profile` | OK (chargé après login pour récupérer les rôles) |

Les **25 autres routes backend** (`/api/courses`, `/api/lessons`, `/api/forum`, etc.) seront branchées au fur et à mesure dans `features/student/`, `features/instructor/`, `features/admin/`.

---

## Test du flux d'authentification

1. Démarrer le backend : `cd ../backend && npm run dev`
2. Démarrer le front : `cd frontend && npm start`
3. Aller sur [http://localhost:4200/auth/register](http://localhost:4200/auth/register)
4. Créer un compte → redirection vers la home, le bandeau affiche votre prénom
5. Se déconnecter → retour à `/auth/login`
6. Se reconnecter avec l'email/mdp créés

Si tout fonctionne : front ↔ back communiquent correctement.

---

## Aliases TypeScript

Configurés dans `tsconfig.json` :

```ts
import { AuthService } from '@core/services/auth.service';
import { environment }  from '@env/environment';
import { LoginComponent } from '@features/auth/pages/login/login.component';
```

---

## Conventions

- **Standalone components uniquement**, pas de NgModule (sauf cas spécifique).
- **ChangeDetectionStrategy.OnPush** sur tous les composants.
- **Signals** pour l'état local des composants, **RxJS** pour les flux HTTP.
- **Reactive Forms** uniquement.
- Commentaires de code en français (cohérence avec le backend).
- Indentation 2 espaces, fin de ligne LF.

---

## Auteur

Birane Diao — Projet de fin d'études 2026.
