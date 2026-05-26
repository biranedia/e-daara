import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * Intercepteur HTTP :
 *   1. Ajoute le header Authorization: Bearer <token> sur chaque requête.
 *   2. Si le backend répond 401 avec code TOKEN_EXPIRED,
 *      tente automatiquement un /auth/refresh-token puis rejoue la requête.
 *   3. Si le refresh échoue, déconnecte l'utilisateur.
 */
let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

const URLS_SANS_TOKEN = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh-token',
  '/public'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(TokenStorageService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const skip = URLS_SANS_TOKEN.some((u) => req.url.includes(u));
  const token = storage.getAccessToken();
  const authReq = !skip && token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !skip && storage.getRefreshToken()) {
        return handle401(authReq, next, auth, storage, router);
      }
      return throwError(() => err);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  storage: TokenStorageService,
  router: Router
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return auth.refreshToken().pipe(
      switchMap((res) => {
        isRefreshing = false;
        const newToken = res.data?.accessToken ?? null;
        refreshSubject.next(newToken);
        if (!newToken) {
          storage.clear();
          router.navigate(['/auth/login']);
          return throwError(() => new Error('Refresh impossible'));
        }
        return next(addToken(req, newToken));
      }),
      catchError((e) => {
        isRefreshing = false;
        storage.clear();
        router.navigate(['/auth/login']);
        return throwError(() => e);
      })
    );
  }

  // Une rotation de token est déjà en cours : attendre qu'elle finisse
  return refreshSubject.pipe(
    filter((t) => t !== null),
    take(1),
    switchMap((t) => next(addToken(req, t as string)))
  );
}
