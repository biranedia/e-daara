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
  }
];
