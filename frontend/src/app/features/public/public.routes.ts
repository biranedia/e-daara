import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'catalogue',
    loadComponent: () =>
      import('./pages/catalogue/catalogue.component').then((m) => m.CatalogueComponent)
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./pages/course-detail/course-detail.component').then((m) => m.CourseDetailComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent)
  }
];
