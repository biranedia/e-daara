import { Routes } from '@angular/router';

/**
 * Routes du module Auth.
 * Chargées en lazy depuis app.routes.ts.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      )
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      )
  },
  {
    path: 'oauth/callback',
    loadComponent: () =>
      import('./pages/oauth-callback/oauth-callback.component').then(
        (m) => m.OAuthCallbackComponent
      )
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
