import { Routes } from '@angular/router';

export const INSTRUCTOR_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/instructor-dashboard/instructor-dashboard.component').then(
        (m) => m.InstructorDashboardComponent
      )
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./pages/instructor-courses/instructor-courses.component').then(
        (m) => m.InstructorCoursesComponent
      )
  },
  {
    path: 'courses/new',
    loadComponent: () =>
      import('./pages/instructor-course-edit/instructor-course-edit.component').then(
        (m) => m.InstructorCourseEditComponent
      )
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./pages/instructor-course-edit/instructor-course-edit.component').then(
        (m) => m.InstructorCourseEditComponent
      )
  },
  {
    path: 'courses/:id/sections',
    loadComponent: () =>
      import('./pages/instructor-sections/instructor-sections.component').then(
        (m) => m.InstructorSectionsComponent
      )
  },
  {
    path: 'paths',
    loadComponent: () =>
      import('./pages/instructor-paths/instructor-paths.component').then(
        (m) => m.InstructorPathsComponent
      )
  },
  {
    path: 'assessments',
    loadComponent: () =>
      import('./pages/instructor-assessments/instructor-assessments.component').then(
        (m) => m.InstructorAssessmentsComponent
      )
  },
  {
    path: 'assessments/:id',
    loadComponent: () =>
      import('./pages/instructor-assessment-edit/instructor-assessment-edit.component').then(
        (m) => m.InstructorAssessmentEditComponent
      )
  },
  {
    path: 'announcements',
    loadComponent: () =>
      import('./pages/instructor-announcements/instructor-announcements.component').then(
        (m) => m.InstructorAnnouncementsComponent
      )
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/instructor-stats/instructor-stats.component').then(
        (m) => m.InstructorStatsComponent
      )
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: 'messages',
    loadComponent: () =>
      import('../messages/messages.component').then((m) => m.MessagesComponent)
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('../notifications/notifications.component').then((m) => m.NotificationsComponent)
  }
];
