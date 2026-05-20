import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

/**
 * Routes principales de l'application E-DAARA.
 *
 * Architecture :
 *   /                → layout public (visiteur)
 *      ├── catalogue, courses/:id, about
 *   /auth/*          → pages auth (sans layout)
 *   /admin/*         → layout admin (admin only)
 *   /instructor/*    → layout formateur (instructor + admin)
 *   /student/*       → layout apprenant (tous rôles authentifiés)
 *   /forum, /messages, /notifications, /profile → routes transverses (authentifié)
 */
export const routes: Routes = [
  // --- Public ---
  {
    path: '',
    loadComponent: () =>
      import('@layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    loadChildren: () =>
      import('@features/public/public.routes').then((m) => m.PUBLIC_ROUTES)
  },

  // --- Authentification (sans layout) ---
  {
    path: 'auth',
    loadChildren: () =>
      import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },

  // --- Admin ---
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('@layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    loadChildren: () =>
      import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },

  // --- Formateur ---
  {
    path: 'instructor',
    canActivate: [authGuard, roleGuard(['instructor', 'admin'])],
    loadComponent: () =>
      import('@layouts/instructor-layout/instructor-layout.component').then(
        (m) => m.InstructorLayoutComponent
      ),
    loadChildren: () =>
      import('@features/instructor/instructor.routes').then((m) => m.INSTRUCTOR_ROUTES)
  },

  // --- Étudiant ---
  {
    path: 'student',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@layouts/student-layout/student-layout.component').then(
        (m) => m.StudentLayoutComponent
      ),
    loadChildren: () =>
      import('@features/student/student.routes').then((m) => m.STUDENT_ROUTES)
  },

  // --- Routes transverses authentifiées ---
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: 'forum',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@features/forum/forum.routes').then((m) => m.FORUM_ROUTES)
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/messages/messages.component').then((m) => m.MessagesComponent)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/notifications/notifications.component').then((m) => m.NotificationsComponent)
  },
  {
    path: 'quiz/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/student/pages/student-quiz/student-quiz.component').then(
        (m) => m.StudentQuizComponent
      )
  },

  { path: '**', redirectTo: '' }
];
