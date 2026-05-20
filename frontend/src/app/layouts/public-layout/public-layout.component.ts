import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '@core/services/auth.service';

/**
 * Layout public (visiteur et apprenant non connecté à la home).
 * Header simple + footer institutionnel souveraineté.
 */
@Component({
  selector: 'app-public-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50">
      <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-2xl font-bold text-edaara-dark">E-DAARA</span>
          </a>

          <nav class="hidden md:flex items-center gap-6" role="navigation">
            <a routerLink="/" routerLinkActive="text-edaara-primary"
               [routerLinkActiveOptions]="{ exact: true }"
               class="text-slate-700 hover:text-edaara-primary">Accueil</a>
            <a routerLink="/catalogue" routerLinkActive="text-edaara-primary"
               class="text-slate-700 hover:text-edaara-primary">Catalogue</a>
            <a routerLink="/about" routerLinkActive="text-edaara-primary"
               class="text-slate-700 hover:text-edaara-primary">À propos</a>
          </nav>

          <div class="flex items-center gap-2">
            @if (auth.isAuthenticated()) {
              <button mat-button [matMenuTriggerFor]="menu" class="!normal-case">
                {{ auth.currentUser()?.prenom }}
                <mat-icon>arrow_drop_down</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                @if (auth.roles().includes('admin')) {
                  <a mat-menu-item routerLink="/admin/dashboard">
                    <mat-icon>admin_panel_settings</mat-icon>
                    Espace admin
                  </a>
                }
                @if (auth.roles().includes('instructor')) {
                  <a mat-menu-item routerLink="/instructor/dashboard">
                    <mat-icon>school</mat-icon>
                    Espace formateur
                  </a>
                }
                <a mat-menu-item routerLink="/student/dashboard">
                  <mat-icon>person</mat-icon>
                  Mon espace
                </a>
                <button mat-menu-item (click)="auth.logout().subscribe()">
                  <mat-icon>logout</mat-icon>
                  Déconnexion
                </button>
              </mat-menu>
            } @else {
              <a mat-stroked-button routerLink="/auth/login">Connexion</a>
              <a mat-flat-button color="primary" routerLink="/auth/register" class="!hidden sm:!inline-flex">
                Inscription
              </a>
            }
          </div>
        </div>
      </header>

      <main class="flex-1"><router-outlet></router-outlet></main>

      <footer class="bg-edaara-dark text-slate-300 mt-auto">
        <div class="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-white font-bold text-xl mb-2">E-DAARA</h3>
            <p class="text-sm text-slate-400">
              Plateforme d'apprentissage en ligne souveraine pour l'Afrique.
              Open-source, hébergée localement, conforme à la loi sénégalaise n°2008-12.
            </p>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-2">Plateforme</h4>
            <ul class="space-y-1 text-sm">
              <li><a routerLink="/catalogue" class="hover:text-white">Catalogue</a></li>
              <li><a routerLink="/about" class="hover:text-white">À propos</a></li>
              <li><a routerLink="/auth/register" class="hover:text-white">S'inscrire</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-2">Souveraineté</h4>
            <ul class="space-y-1 text-sm">
              <li>🇸🇳 Hébergement à Dakar</li>
              <li>📜 Loi n°2008-12 (CDP)</li>
              <li>🔓 Open-source AGPL-3.0</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-slate-700 py-4 text-center text-xs text-slate-500">
          © 2026 E-DAARA · Birane Diao · IPG/ISTI
        </div>
      </footer>
    </div>
  `
})
export class PublicLayoutComponent {
  protected readonly auth = inject(AuthService);
}
