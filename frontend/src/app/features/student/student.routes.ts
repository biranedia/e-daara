import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/student-dashboard/student-dashboard.component').then((m) => m.StudentDashboardComponent)
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./pages/student-courses/student-courses.component').then((m) => m.StudentCoursesComponent)
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./pages/student-course-player/student-course-player.component').then(
        (m) => m.StudentCoursePlayerComponent
      )
  },
  {
    path: 'paths',
    loadComponent: () =>
      import('./pages/student-paths/student-paths.component').then((m) => m.StudentPathsComponent)
  },
  {
    path: 'quiz/:id',
    loadComponent: () =>
      import('./pages/student-quiz/student-quiz.component').then((m) => m.StudentQuizComponent)
  },
  {
    path: 'certificates',
    loadComponent: () =>
      import('./pages/student-certificates/student-certificates.component').then(
        (m) => m.StudentCertificatesComponent
      )
  },
  {
    path: 'badges',
    loadComponent: () =>
      import('./pages/student-badges/student-badges.component').then((m) => m.StudentBadgesComponent)
  },
  {
    path: 'catalogue',
    loadComponent: () =>
      import('@features/public/pages/catalogue/catalogue.component').then((m) => m.CatalogueComponent)
  },
  {
    path: 'courses-public/:id',
    loadComponent: () =>
      import('@features/public/pages/course-detail/course-detail.component').then((m) => m.CourseDetailComponent)
  },
  // Routes transverses (partagées par tous les rôles authentifiés)
  {
    path: 'profile',
    loadComponent: () =>
      import('@features/profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: 'messages',
    loadComponent: () =>
      import('@features/messages/messages.component').then((m) => m.MessagesComponent)
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('@features/notifications/notifications.component').then((m) => m.NotificationsComponent)
  },
  {
    path: 'forum',
    loadChildren: () =>
      import('@features/forum/forum.routes').then((m) => m.FORUM_ROUTES)
  }
];
