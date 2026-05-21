import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '@core/services/auth.service';

/**
 * Barre supérieure réutilisable :
 * - bouton menu (mobile)
 * - notifications (badge)
 * - menu utilisateur (profil, déconnexion)
 * - sélecteur langue
 */
@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  template: `
    <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6"
            role="banner">
      <div class="flex items-center gap-2">
        <button mat-icon-button class="lg:hidden" (click)="toggleSidebar.emit()"
                aria-label="Ouvrir le menu">
          <mat-icon>menu</mat-icon>
        </button>
        <h2 class="text-lg font-semibold text-slate-700 hidden sm:block">
          <ng-content></ng-content>
        </h2>
      </div>

      <div class="flex items-center gap-2">
        <!-- Notifications -->
        <a mat-icon-button routerLink="/notifications" aria-label="Notifications"
           [matBadge]="unread || null"
           [matBadgeHidden]="unread === 0"
           matBadgeColor="warn">
          <mat-icon>notifications</mat-icon>
        </a>

        <!-- Sélecteur de langue (multilinguisme) -->
        <button mat-icon-button [matMenuTriggerFor]="langMenu" aria-label="Changer la langue">
          <mat-icon>language</mat-icon>
        </button>
        <mat-menu #langMenu="matMenu">
          <button mat-menu-item (click)="setLang('fr')">🇫🇷 Français</button>
          <button mat-menu-item (click)="setLang('en')">🇬🇧 English</button>
          <button mat-menu-item (click)="setLang('wo')">🇸🇳 Wolof</button>
        </mat-menu>

        <!-- Menu utilisateur -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="!normal-case"
                aria-label="Menu utilisateur">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-edaara-primary text-white flex items-center justify-center font-semibold">
              {{ initials() }}
            </div>
            <span class="hidden sm:block text-sm text-slate-700">
              {{ auth.currentUser()?.prenom }}
            </span>
          </div>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Mon profil</span>
          </button>
          <button mat-menu-item routerLink="/notifications">
            <mat-icon>notifications</mat-icon>
            <span>Notifications</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Déconnexion</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `
})
export class AppTopbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @Output() toggleSidebar = new EventEmitter<void>();
  unread = 0;

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase();
  }

  setLang(_lang: string): void {
    // Implémenté par le service de traduction (cf. AppComponent + ngx-translate)
    document.documentElement.lang = _lang;
    localStorage.setItem('edaara_lang', _lang);
    window.location.reload();
  }

  logout(): void {
    this.auth.logout().subscribe();
  }
}
