import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';
import { ApiResponse, AuthResponse, User } from '../models/user.model';

/**
 * Service d'authentification.
 * Branché sur les endpoints backend :
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/refresh-token
 *   POST /api/auth/logout
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password
 *   GET  /api/users/profile
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(TokenStorageService);
  private readonly router = inject(Router);

  // État utilisateur courant exposé en Signal (Angular 18)
  private readonly userSignal = signal<User | null>(this.storage.getUser());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly roles = computed(() => this.userSignal()?.roles ?? []);

  // Stream RxJS pour les composants qui préfèrent les Observables
  private readonly user$ = new BehaviorSubject<User | null>(this.storage.getUser());
  readonly currentUser$ = this.user$.asObservable();

  /**
   * Inscription locale — attend le chargement du profil complet (avec rôles)
   * avant de compléter l'Observable.
   */
  register(payload: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', payload).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      switchMap((res) =>
        this.loadProfile().pipe(
          map(() => res),
          catchError(() => of(res))
        )
      )
    );
  }

  /**
   * Connexion email / mot de passe — attend le profil complet (avec rôles).
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      switchMap((res) =>
        this.loadProfile().pipe(
          map(() => res),
          catchError(() => of(res))
        )
      )
    );
  }

  /**
   * Renouveler un access token via le refresh token stocké.
   */
  refreshToken(): Observable<ApiResponse<{ accessToken: string; expiresIn: string }>> {
    const refreshToken = this.storage.getRefreshToken();
    return this.api.post<ApiResponse<{ accessToken: string; expiresIn: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    ).pipe(
      tap((res) => {
        if (res.success && res.data?.accessToken) {
          this.storage.saveAccessToken(res.data.accessToken);
        }
      })
    );
  }

  /**
   * Déconnexion : appelle le backend et purge le stockage local.
   */
  logout(): Observable<unknown> {
    const refreshToken = this.storage.getRefreshToken();
    const obs = refreshToken
      ? this.api.post('/auth/logout', { refreshToken })
      : of(null);

    return obs.pipe(
      tap(() => {
        this.storage.clear();
        this.userSignal.set(null);
        this.user$.next(null);
        this.router.navigate(['/auth/login']);
      })
    );
  }

  /**
   * Charger le profil complet (avec rôles) depuis /api/users/profile.
   * Utilisé au démarrage et après login pour récupérer les rôles RBAC.
   */
  loadProfile(): Observable<ApiResponse<{ user: User }>> {
    return this.api.get<ApiResponse<{ user: User }>>('/users/profile').pipe(
      tap((res) => {
        if (res.success && res.data?.user) {
          this.storage.saveUser(res.data.user);
          this.userSignal.set(res.data.user);
          this.user$.next(res.data.user);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<unknown>> {
    return this.api.post<ApiResponse<unknown>>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<unknown>> {
    return this.api.post<ApiResponse<unknown>>('/auth/reset-password', { token, newPassword });
  }

  updateProfile(payload: Partial<User>): Observable<ApiResponse<unknown>> {
    return this.api.put<ApiResponse<unknown>>('/users/profile', payload).pipe(
      tap((res) => {
        if (res.success) {
          const updated = { ...this.userSignal()!, ...payload };
          this.storage.saveUser(updated);
          this.userSignal.set(updated);
          this.user$.next(updated);
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<unknown>> {
    return this.api.post<ApiResponse<unknown>>('/users/change-password', {
      currentPassword,
      newPassword
    });
  }

  /**
   * Stocke les tokens et les informations minimales de l'utilisateur.
   * Le profil complet (avec rôles) est chargé dans le pipe login/register.
   */
  private handleAuthSuccess(res: AuthResponse): void {
    if (!res?.success || !res.data) return;
    this.storage.saveTokens(res.data.accessToken, res.data.refreshToken);
    const minimalUser: User = {
      id: res.data.userId,
      email: res.data.email,
      nom: res.data.nom,
      prenom: res.data.prenom,
      status: 'active'
    };
    this.storage.saveUser(minimalUser);
    this.userSignal.set(minimalUser);
    this.user$.next(minimalUser);
  }
}
