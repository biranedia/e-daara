import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

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

  // --- Étudiant + routes transverses (profile, messages, notifications, forum, quiz) ---
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

  { path: '**', redirectTo: '' }
];
