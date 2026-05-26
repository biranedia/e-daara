import { Routes } from '@angular/router';

export const FORUM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/forum-list/forum-list.component').then((m) => m.ForumListComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/forum-thread/forum-thread.component').then((m) => m.ForumThreadComponent)
  }
];
