var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';
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
let AuthService = (() => {
    let _classDecorators = [Injectable({ providedIn: 'root' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        api = inject(ApiService);
        storage = inject(TokenStorageService);
        router = inject(Router);
        // État utilisateur courant exposé en Signal (Angular 18)
        userSignal = signal(this.storage.getUser());
        currentUser = this.userSignal.asReadonly();
        isAuthenticated = computed(() => this.userSignal() !== null);
        roles = computed(() => this.userSignal()?.roles ?? []);
        // Stream RxJS pour les composants qui préfèrent les Observables
        user$ = new BehaviorSubject(this.storage.getUser());
        currentUser$ = this.user$.asObservable();
        /**
         * Inscription locale — attend le chargement du profil complet (avec rôles)
         * avant de compléter l'Observable.
         */
        register(payload) {
            return this.api.post('/auth/register', payload).pipe(tap((res) => this.handleAuthSuccess(res)), switchMap((res) => this.loadProfile().pipe(map(() => res), catchError(() => of(res)))));
        }
        /**
         * Connexion email / mot de passe — attend le profil complet (avec rôles).
         */
        login(email, password) {
            return this.api.post('/auth/login', { email, password }).pipe(tap((res) => this.handleAuthSuccess(res)), switchMap((res) => this.loadProfile().pipe(map(() => res), catchError(() => of(res)))));
        }
        /**
         * Renouveler un access token via le refresh token stocké.
         */
        refreshToken() {
            const refreshToken = this.storage.getRefreshToken();
            return this.api.post('/auth/refresh-token', { refreshToken }).pipe(tap((res) => {
                if (res.success && res.data?.accessToken) {
                    this.storage.saveAccessToken(res.data.accessToken);
                }
            }));
        }
        /**
         * Déconnexion : appelle le backend et purge le stockage local.
         */
        logout() {
            const refreshToken = this.storage.getRefreshToken();
            const obs = refreshToken
                ? this.api.post('/auth/logout', { refreshToken })
                : of(null);
            return obs.pipe(tap(() => {
                this.storage.clear();
                this.userSignal.set(null);
                this.user$.next(null);
                this.router.navigate(['/auth/login']);
            }));
        }
        /**
         * Charger le profil complet (avec rôles) depuis /api/users/profile.
         * Utilisé au démarrage et après login pour récupérer les rôles RBAC.
         */
        loadProfile() {
            return this.api.get('/users/profile').pipe(tap((res) => {
                if (res.success && res.data?.user) {
                    this.storage.saveUser(res.data.user);
                    this.userSignal.set(res.data.user);
                    this.user$.next(res.data.user);
                }
            }));
        }
        forgotPassword(email) {
            return this.api.post('/auth/forgot-password', { email });
        }
        resetPassword(token, newPassword) {
            return this.api.post('/auth/reset-password', { token, newPassword });
        }
        updateProfile(payload) {
            return this.api.put('/users/profile', payload).pipe(tap((res) => {
                if (res.success) {
                    const updated = { ...this.userSignal(), ...payload };
                    this.storage.saveUser(updated);
                    this.userSignal.set(updated);
                    this.user$.next(updated);
                }
            }));
        }
        changePassword(currentPassword, newPassword) {
            return this.api.post('/users/change-password', {
                currentPassword,
                newPassword
            });
        }
        /**
         * Stocke les tokens et les informations minimales de l'utilisateur.
         * Le profil complet (avec rôles) est chargé dans le pipe login/register.
         */
        handleAuthSuccess(res) {
            if (!res?.success || !res.data)
                return;
            this.storage.saveTokens(res.data.accessToken, res.data.refreshToken);
            const minimalUser = {
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
    };
    return AuthService = _classThis;
})();
export { AuthService };
