import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '@core/services/auth.service';

export interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  template: `
    <aside
      class="bg-white border-r border-slate-200 flex flex-col h-full w-64"
      [attr.aria-label]="title">

      <!-- En-tête -->
      <div class="px-5 py-5 border-b border-slate-200">
        <h1 class="text-2xl font-bold text-edaara-dark">E-DAARA</h1>
        <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider">{{ title }}</p>
      </div>

      <!-- Navigation principale -->
      <nav class="flex-1 overflow-y-auto py-3" role="navigation">
        @for (item of items; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-edaara-primary/10 text-edaara-primary border-l-4 border-edaara-primary"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-5 py-3 text-slate-700 hover:bg-slate-50 transition-colors border-l-4 border-transparent">
            <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
            <span class="flex-1">{{ item.label }}</span>
            @if (item.badge) {
              <span class="bg-edaara-accent text-white text-xs px-2 py-0.5 rounded-full"
                    [attr.aria-label]="item.badge + ' éléments non lus'">
                {{ item.badge }}
              </span>
            }
          </a>
        }
      </nav>

      <!-- Pied de sidebar : utilisateur + déconnexion -->
      <div class="border-t border-slate-200">
        <div class="px-5 py-3 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-edaara-primary text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {{ initials() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-800 truncate">
              {{ auth.currentUser()?.prenom }} {{ auth.currentUser()?.nom }}
            </p>
            <p class="text-xs text-slate-500 truncate">{{ auth.currentUser()?.email }}</p>
          </div>
        </div>
        <button
          (click)="logout()"
          class="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">
          <mat-icon aria-hidden="true">logout</mat-icon>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  `
})
export class AppSidebarComponent {
  @Input() title = '';
  @Input() items: SidebarItem[] = [];

  protected readonly auth = inject(AuthService);

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase();
  }

  logout(): void {
    this.auth.logout().subscribe();
  }
}
