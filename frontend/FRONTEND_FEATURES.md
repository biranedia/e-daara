# E-DAARA — Frontend : Inventaire des fonctionnalités

Document qui croise les **exigences du cahier des charges (CDC v1.0 + plan directeur)** avec ce qui est **implémenté dans le code Angular**.

À utiliser pour la soutenance et pour rédiger le chapitre 10 du mémoire.

---

## 1. Architecture (CDC Ch. 10)

| Exigence | Statut | Fichier(s) |
|---|---|---|
| Angular SPA (Hypothèse H3) | ✅ | Angular 18 standalone components |
| Modules / composants / services | ✅ | `src/app/{core,shared,layouts,features}/` |
| Guards | ✅ | `core/guards/auth.guard.ts`, `role.guard.ts` |
| Interceptors | ✅ | `core/interceptors/auth.interceptor.ts` |
| Lazy loading | ✅ | `loadComponent` + `loadChildren` partout |
| Responsive mobile-first (H1) | ✅ | Tailwind utilities + Angular Material breakpoints |

## 2. Authentification & RBAC (CDC §6.3, Ch. 11)

| Exigence | Statut | Fichier(s) |
|---|---|---|
| JWT access + refresh token | ✅ | `auth.service.ts` + `auth.interceptor.ts` (refresh auto sur 401) |
| Durée JWT courte (15-60 min) | ✅ | Configurée côté back (`.env`) — 900 sec |
| OAuth Google (bouton) | ✅ front | `login.component.html` (back à finaliser) |
| OAuth Facebook (bouton) | ✅ front | `login.component.html` (back à finaliser) |
| RBAC : Visiteur, Apprenant, Formateur, Admin | ✅ | `role.guard.ts` + routes dans `app.routes.ts` |
| Reset password | ✅ | `auth/pages/reset-password/` + `forgot-password/` |

## 3. Espace Admin (CDC Ch. 9 + §6.4 souveraineté)

| Exigence | Statut | Page |
|---|---|---|
| Tableau de bord agrégé | ✅ | `admin-dashboard.component` |
| Gestion utilisateurs (CRUD + statuts) | ✅ | `admin-users.component` |
| **Logs d'audit (souveraineté)** | ✅ | `admin-audit-logs.component` — filtres module/statut/recherche |
| Validation des cours (approuver/refuser) | ✅ | `admin-courses-pending.component` |
| Statistiques globales | ✅ | `admin-stats.component` |
| Paramètres plateforme | ✅ | `admin-settings.component` |
| **Demandes RGPD (loi sénégalaise n°2008-12)** | ✅ | `admin-gdpr.component` |

## 4. Espace Formateur (CDC Ch. 10)

| Exigence | Statut | Page |
|---|---|---|
| Tableau de bord | ✅ | `instructor-dashboard.component` |
| CRUD cours | ✅ | `instructor-courses.component` + `instructor-course-edit.component` |
| CRUD sections | ✅ | `instructor-sections.component` |
| CRUD leçons (vidéo/PDF/texte/lien) | ✅ | `instructor-sections.component` |
| CRUD parcours | ✅ | `instructor-paths.component` |
| Créer quiz QCM/Vrai-Faux/Texte | ✅ | `instructor-assessments.component` + `instructor-assessment-edit.component` |
| Ajouter questions et réponses | ✅ | `instructor-assessment-edit.component` |
| Publier annonces | ✅ | `instructor-announcements.component` |
| Voir statistiques de ses cours | ✅ | `instructor-stats.component` |

## 5. Espace Apprenant (CDC Ch. 10)

| Exigence | Statut | Page |
|---|---|---|
| Tableau de bord progression | ✅ | `student-dashboard.component` |
| Mes cours avec progression | ✅ | `student-courses.component` |
| **Lecteur de cours (vidéo + PDF + texte + lien)** | ✅ | `student-course-player.component` |
| Navigation par section/leçon | ✅ | Sommaire intégré au lecteur |
| Marquage leçon comme terminée | ✅ | Bouton "Marquer terminé" |
| **Quiz interactif avec score auto** | ✅ | `student-quiz.component` |
| Certificats | ✅ | `student-certificates.component` |
| Badges (débloqués + à débloquer) | ✅ | `student-badges.component` |
| Parcours suivis | ✅ | `student-paths.component` |

## 6. Catalogue public (visiteur)

| Exigence | Statut | Page |
|---|---|---|
| Page d'accueil avec hero souveraineté | ✅ | `home.component` |
| Catalogue avec recherche + filtres | ✅ | `catalogue.component` |
| Détail d'un cours | ✅ | `course-detail.component` |
| Inscription gratuite | ✅ | Bouton "Rejoindre le cours" |
| Page À propos / souveraineté | ✅ | `about.component` |

## 7. Modules sociaux

| Exigence | Statut | Page |
|---|---|---|
| Notifications | ✅ | `notifications.component` |
| Messagerie privée | ✅ | `messages.component` |
| Forum (sujets + réponses) | ✅ | `forum-list.component` + `forum-thread.component` |
| Annonces (formateur) | ✅ | `instructor-announcements.component` |

## 8. Profil utilisateur

| Exigence | Statut | Page |
|---|---|---|
| Édition profil (nom, prénom, bio, avatar, langue) | ✅ | `profile.component` (onglet Profil) |
| Changement mot de passe | ✅ | `profile.component` (onglet Mot de passe) |
| **Droits RGPD : export, rectif, suppression, oubli** | ✅ | `profile.component` (onglet Mes données) |

## 9. Multilinguisme (CDC §6.4 contexte africain)

| Langue | Statut | Fichier |
|---|---|---|
| Français | ✅ | `public/assets/i18n/fr.json` |
| Anglais | ✅ | `public/assets/i18n/en.json` |
| **Wolof** | ✅ | `public/assets/i18n/wo.json` (Daara, Dugg, Yegle...) |

Sélecteur de langue dans la topbar des espaces connectés.

## 10. Accessibilité WCAG 2.1 niveau AA (CDC)

| Exigence | Statut | Implémentation |
|---|---|---|
| Skip-link "Aller au contenu principal" | ✅ | Dans `role-layout.component` |
| Labels ARIA sur les boutons-icônes | ✅ | `aria-label` partout |
| Focus visible renforcé (3px ambre) | ✅ | `styles.scss` |
| Réduction animation pour utilisateurs sensibles | ✅ | `prefers-reduced-motion` |
| Contrastes suffisants (texte/fond) | ✅ | Palette teal/dark vérifiée |
| Navigation au clavier | ✅ | Material gère nativement |
| `<noscript>` fallback | ✅ | `index.html` |
| Sémantique HTML (`<header>`, `<nav>`, `<main>`, `<aside>`, `<article>`) | ✅ | Partout |

## 11. Souveraineté numérique (CDC §6.4 — fil rouge du mémoire)

| Critère | Statut | Preuve dans le code |
|---|---|---|
| Aucune dépendance Firebase / AWS S3 | ✅ | `package.json` ne contient aucune lib cloud US |
| Hébergement local mentionné | ✅ | Page "À propos" + footer "Hébergé à Dakar" |
| Loi sénégalaise n°2008-12 citée | ✅ | Page "À propos" + module RGPD admin |
| Logs d'audit consultables | ✅ | `/admin/audit-logs` (filtres + IP visibles) |
| Open-source AGPL-3.0 | ✅ | Footer + page "À propos" |

## 12. Endpoints backend câblés (toutes les routes API REST utilisées)

| Endpoint backend | Service Angular | Page(s) consommatrice(s) |
|---|---|---|
| `/auth/*` | `AuthService` | login, register, forgot, reset |
| `/users/profile`, `/users/change-password` | `AuthService` + direct | `profile.component` |
| `/public/courses`, `/public/categories`, `/public/paths` | `CourseService` + `PathService` | catalogue, home, course-detail |
| `/courses` (CRUD) | `CourseService` | instructor-courses, instructor-course-edit |
| `/sections` (CRUD) | `CourseService` | instructor-sections |
| `/lessons` (CRUD) | `CourseService` | instructor-sections, student-course-player |
| `/enrollments` (CRUD + progress + complete) | `EnrollmentService` | student-courses, course-detail |
| `/progress/lessons`, `/progress/paths` | `EnrollmentService` | student-course-player |
| `/work-sessions` | `EnrollmentService` | (background tracking) |
| `/assessments`, `/assessments/.../questions`, `/answers` | `AssessmentService` | instructor-assessment-edit, student-quiz |
| `/submissions` | `AssessmentService` | student-quiz |
| `/admin/dashboard`, `/admin/users`, `/admin/courses/pending`, `/admin/courses/.../validate`, `/admin/audit-logs` | `AdminService` | tout l'espace admin |
| `/dashboard/student` | `AdminService` | student-dashboard |
| `/stats/latest`, `/stats/refresh` | `AdminService` | admin-stats |
| `/settings`, `/settings/:cle` | `AdminService` | admin-settings |
| `/gdpr`, `/gdpr/mine`, `/gdpr/:id/status` | `AdminService` | profile + admin-gdpr |
| `/notifications` (CRUD + read) | `SocialService` | notifications.component |
| `/messages` (CRUD + read) | `SocialService` | messages.component |
| `/forum` (CRUD) | `SocialService` | forum-list, forum-thread |
| `/announcements` (CRUD) | `SocialService` | instructor-announcements |
| `/certificates`, `/certificates/verify/:numero` | `SocialService` | student-certificates |
| `/badges`, `/badges/mine` | `SocialService` | student-badges |
| `/paths` (CRUD) | `PathService` | instructor-paths, student-paths |

**Total : 25 routes backend × intégration 1:1 côté front.**

---

## À démontrer en soutenance (CDC §6.5)

1. **Inscription** d'un visiteur → redirection vers home connecté.
2. **Connexion admin** (`admin@edaara.sn` / `Admin1234!`) → tableau de bord admin.
3. **Logs d'audit** : ouvrir `/admin/audit-logs` → montrer les filtres et l'IP loggée pour chaque action (✦ preuve visible de la souveraineté ✦).
4. **Validation cours** : connexion formateur → créer cours → soumettre → admin valide → publié.
5. **Inscription d'un apprenant** à un cours depuis le catalogue.
6. **Lecteur de cours** : naviguer les sections/leçons → marquer terminé.
7. **Quiz interactif** : passer un QCM → score automatique.
8. **OAuth Google** (à finaliser back).
9. **Demande RGPD** : utilisateur clique "Exporter mes données" → admin reçoit la demande.
10. **Changement de langue** dans la topbar → FR / EN / Wolof.
