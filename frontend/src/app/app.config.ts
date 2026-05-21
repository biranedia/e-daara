import {
  ApplicationConfig, provideZoneChangeDetection, importProvidersFrom,
  APP_INITIALIZER, inject
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { catchError, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthService } from '@core/services/auth.service';
import { TokenStorageService } from '@core/services/token-storage.service';

/**
 * Loader des fichiers de traduction (FR / EN / Wolof).
 * Charge les JSON depuis assets/i18n/{lang}.json.
 */
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/**
 * Configuration globale de l'application Angular (standalone).
 * - Router avec liaison automatique des inputs et view transitions
 * - HttpClient avec intercepteur JWT + refresh
 * - Animations Material asynchrones
 * - Multilinguisme ngx-translate
 */
function initApp() {
  const auth = inject(AuthService);
  const storage = inject(TokenStorageService);
  return () => {
    if (!storage.getAccessToken()) return of(null);
    return auth.loadProfile().pipe(catchError(() => of(null)));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    { provide: APP_INITIALIZER, useFactory: initApp, multi: true },
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: localStorage.getItem('edaara_lang') ?? 'fr',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
