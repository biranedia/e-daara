import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/admin-users/admin-users.component').then((m) => m.AdminUsersComponent)
  },
  {
    path: 'courses-pending',
    loadComponent: () =>
      import('./pages/admin-courses-pending/admin-courses-pending.component').then(
        (m) => m.AdminCoursesPendingComponent
      )
  },
  {
    path: 'audit-logs',
    loadComponent: () =>
      import('./pages/admin-audit-logs/admin-audit-logs.component').then((m) => m.AdminAuditLogsComponent)
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/admin-stats/admin-stats.component').then((m) => m.AdminStatsComponent)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/admin-settings/admin-settings.component').then((m) => m.AdminSettingsComponent)
  },
  {
    path: 'gdpr',
    loadComponent: () =>
      import('./pages/admin-gdpr/admin-gdpr.component').then((m) => m.AdminGdprComponent)
  }
];
