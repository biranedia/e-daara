import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

export interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

/**
 * Sidebar réutilisable utilisée par chaque layout (admin, formateur, apprenant).
 * Reçoit un titre + une liste de liens en input.
 * Compatible mobile (overlay) et desktop (fixe).
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  template: `
    <aside
      class="bg-white border-r border-slate-200 flex flex-col h-full w-64"
      [attr.aria-label]="title">
      <div class="px-5 py-5 border-b border-slate-200">
        <h1 class="text-2xl font-bold text-edaara-dark">E-DAARA</h1>
        <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider">{{ title }}</p>
      </div>

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

      <div class="p-4 border-t border-slate-200 text-xs text-slate-500">
        © 2026 E-DAARA · Souveraineté numérique africaine
      </div>
    </aside>
  `
})
export class AppSidebarComponent {
  @Input() title = '';
  @Input() items: SidebarItem[] = [];
}
