import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { User } from '../models/user.model';

/**
 * Stockage local des tokens JWT et de l'utilisateur courant.
 * Encapsule localStorage pour pouvoir basculer plus tard vers
 * sessionStorage / cookies sécurisés sans toucher le reste du code.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly accessKey = environment.tokenStorageKey;
  private readonly refreshKey = environment.refreshTokenStorageKey;
  private readonly userKey = environment.userStorageKey;

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessKey, accessToken);
    localStorage.setItem(this.refreshKey, refreshToken);
  }

  saveAccessToken(accessToken: string): void {
    localStorage.setItem(this.accessKey, accessToken);
  }

  saveUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clear(): void {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
  }
}
