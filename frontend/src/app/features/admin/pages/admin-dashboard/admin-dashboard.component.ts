import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '@core/services/admin.service';
import { AdminDashboardStats } from '@core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Tableau de bord administration</h1>
        <p class="text-slate-500">Vue d'ensemble de la plateforme E-DAARA</p>
      </header>

      @if (loading()) {
        <div class="flex justify-center py-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (stats()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500">Utilisateurs</p>
                <p class="text-3xl font-bold text-edaara-dark mt-1">{{ stats()!.total_users }}</p>
                <p class="text-xs text-green-600 mt-1">{{ stats()!.active_users }} actifs</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <mat-icon class="text-blue-600">people</mat-icon>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500">Cours publiés</p>
                <p class="text-3xl font-bold text-edaara-dark mt-1">{{ stats()!.published_courses }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <mat-icon class="text-edaara-primary">menu_book</mat-icon>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500">Inscriptions</p>
                <p class="text-3xl font-bold text-edaara-dark mt-1">{{ stats()!.total_enrollments }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <mat-icon class="text-edaara-accent">how_to_reg</mat-icon>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500">Quiz passés</p>
                <p class="text-3xl font-bold text-edaara-dark mt-1">{{ stats()!.total_quiz_submissions }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <mat-icon class="text-purple-600">quiz</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Cartes d'action rapide souveraineté -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a routerLink="/admin/audit-logs"
             class="bg-edaara-dark text-white rounded-xl p-6 hover:bg-slate-800 transition-colors block">
            <mat-icon class="!w-10 !h-10 !text-4xl">security</mat-icon>
            <h3 class="font-bold text-lg mt-3">Logs d'audit</h3>
            <p class="text-sm text-slate-300 mt-1">
              Traçabilité complète des actions — preuve visible de la souveraineté numérique
            </p>
          </a>
          <a routerLink="/admin/courses-pending"
             class="bg-edaara-primary text-white rounded-xl p-6 hover:opacity-90 transition-opacity block">
            <mat-icon class="!w-10 !h-10 !text-4xl">verified</mat-icon>
            <h3 class="font-bold text-lg mt-3">Validation des cours</h3>
            <p class="text-sm text-teal-100 mt-1">
              Approuver ou refuser les cours soumis par les formateurs
            </p>
          </a>
          <a routerLink="/admin/gdpr"
             class="bg-edaara-accent text-white rounded-xl p-6 hover:opacity-90 transition-opacity block">
            <mat-icon class="!w-10 !h-10 !text-4xl">privacy_tip</mat-icon>
            <h3 class="font-bold text-lg mt-3">RGPD / CDP</h3>
            <p class="text-sm text-amber-100 mt-1">
              Demandes utilisateurs — Loi sénégalaise n°2008-12
            </p>
          </a>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);

  readonly stats = signal<AdminDashboardStats | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.admin.dashboard().subscribe({
      next: (res) => {
        this.stats.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
