import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppSidebarComponent, SidebarItem } from '@shared/components/app-sidebar/app-sidebar.component';
import { AppTopbarComponent } from '@shared/components/app-topbar/app-topbar.component';

/**
 * Layout générique réutilisé pour chaque rôle (admin, formateur, apprenant).
 * Reçoit un titre + une liste de liens de navigation.
 */
@Component({
  selector: 'app-role-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, AppSidebarComponent, AppTopbarComponent],
  template: `
    <div class="h-screen flex bg-slate-50">
      <!-- Skip-link accessibilité WCAG -->
      <a href="#main-content"
         class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-edaara-primary text-white px-3 py-2 rounded z-50">
        Aller au contenu principal
      </a>

      <!-- Sidebar desktop -->
      <div class="hidden lg:flex">
        <app-sidebar [title]="title" [items]="items"></app-sidebar>
      </div>

      <!-- Sidebar mobile (overlay) -->
      @if (mobileOpen()) {
        <div class="lg:hidden fixed inset-0 z-40">
          <div class="absolute inset-0 bg-black/40" (click)="mobileOpen.set(false)"></div>
          <div class="absolute left-0 top-0 bottom-0">
            <app-sidebar [title]="title" [items]="items"></app-sidebar>
          </div>
        </div>
      }

      <!-- Zone principale -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-topbar (toggleSidebar)="toggleMobile()">{{ pageTitle }}</app-topbar>
        <main id="main-content" class="flex-1 overflow-auto p-4 lg:p-6" tabindex="-1">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class RoleLayoutComponent {
  @Input({ required: true }) title = '';
  @Input() pageTitle = '';
  @Input({ required: true }) items: SidebarItem[] = [];

  readonly mobileOpen = signal(false);

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }
}
