import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '@core/services/admin.service';
import { AdminDashboardStats } from '@core/models';

const C = 2 * Math.PI * 38; // SVG donut circumference (r=38)

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6">

      <!-- En-tête -->
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Tableau de bord</h1>
          <p class="text-slate-500 text-sm">Vue d'ensemble de la plateforme E-DAARA</p>
        </div>
        <button mat-stroked-button (click)="refresh()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon>
          Actualiser
        </button>
      </header>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (stats()) {

        <!-- KPI CARDS -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <mat-icon class="!text-lg text-blue-600">people</mat-icon>
              </div>
              <span class="text-xs text-slate-500 uppercase tracking-wider">Utilisateurs</span>
            </div>
            <p class="text-2xl font-bold text-edaara-dark">{{ stats()!.total_users }}</p>
            <p class="text-xs text-slate-500 mt-1">
              <span class="text-green-600 font-medium">{{ stats()!.active_users }} actifs</span>
              @if (stats()!.suspended_users > 0) {
                · <span class="text-red-500">{{ stats()!.suspended_users }} suspendus</span>
              }
            </p>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <mat-icon class="!text-lg text-edaara-primary">menu_book</mat-icon>
              </div>
              <span class="text-xs text-slate-500 uppercase tracking-wider">Cours</span>
            </div>
            <p class="text-2xl font-bold text-edaara-dark">{{ stats()!.published_courses }}</p>
            <p class="text-xs text-slate-500 mt-1">
              publiés
              @if (stats()!.pending_courses > 0) {
                · <span class="text-amber-600 font-medium">{{ stats()!.pending_courses }} en attente</span>
              }
            </p>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <mat-icon class="!text-lg text-edaara-accent">how_to_reg</mat-icon>
              </div>
              <span class="text-xs text-slate-500 uppercase tracking-wider">Inscriptions</span>
            </div>
            <p class="text-2xl font-bold text-edaara-dark">{{ stats()!.total_enrollments }}</p>
            <p class="text-xs text-slate-500 mt-1">total</p>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <mat-icon class="!text-lg text-green-600">check_circle</mat-icon>
              </div>
              <span class="text-xs text-slate-500 uppercase tracking-wider">Complétions</span>
            </div>
            <p class="text-2xl font-bold text-edaara-dark">{{ stats()!.completed_enrollments }}</p>
            <p class="text-xs text-slate-500 mt-1">
              <span class="text-green-600 font-medium">{{ completionRate() }}%</span> taux
            </p>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <mat-icon class="!text-lg text-purple-600">quiz</mat-icon>
              </div>
              <span class="text-xs text-slate-500 uppercase tracking-wider">Quiz</span>
            </div>
            <p class="text-2xl font-bold text-edaara-dark">{{ stats()!.total_quiz_submissions }}</p>
            <p class="text-xs text-slate-500 mt-1">passages</p>
          </div>
        </div>

        <!-- CHARTS ROW -->
        <div class="grid lg:grid-cols-2 gap-4">

          <!-- Donut chart: répartition utilisateurs -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 class="font-semibold text-edaara-dark text-sm mb-4">Répartition des utilisateurs</h3>
            <div class="flex items-center gap-6">
              <!-- SVG Donut -->
              <div class="relative flex-shrink-0">
                <svg viewBox="0 0 100 100" class="w-32 h-32 -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" stroke-width="14"/>
                  @for (seg of donutSegments(); track seg.label) {
                    <circle
                      cx="50" cy="50" r="38"
                      fill="none"
                      [attr.stroke]="seg.color"
                      stroke-width="14"
                      [attr.stroke-dasharray]="seg.len + ' ' + circum"
                      [attr.stroke-dashoffset]="seg.offset"
                    />
                  }
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-xl font-bold text-edaara-dark leading-none">{{ stats()!.total_users }}</span>
                  <span class="text-xs text-slate-500">total</span>
                </div>
              </div>
              <!-- Legend -->
              <div class="space-y-3 flex-1">
                @for (seg of donutSegments(); track seg.label) {
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full flex-shrink-0" [style.background-color]="seg.color"></div>
                    <div class="flex-1">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-600">{{ seg.label }}</span>
                        <span class="font-semibold text-edaara-dark">{{ seg.value }}</span>
                      </div>
                      <div class="h-1.5 bg-slate-100 rounded-full mt-0.5">
                        <div class="h-full rounded-full" [style.width.%]="seg.pct" [style.background-color]="seg.color"></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Bar chart: activité plateforme -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 class="font-semibold text-edaara-dark text-sm mb-4">Activité de la plateforme</h3>
            <div class="space-y-3">
              @for (bar of barChartData(); track bar.label) {
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-slate-600">{{ bar.label }}</span>
                    <div class="text-right">
                      <span class="text-sm font-bold text-edaara-dark">{{ bar.value }}</span>
                      @if (bar.total) {
                        <span class="text-xs text-slate-400"> / {{ bar.total }}</span>
                      }
                    </div>
                  </div>
                  <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                         [style.width.%]="bar.pct"
                         [style.background-color]="bar.color">
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Cours par statut -->
            <div class="mt-5 pt-4 border-t border-slate-100">
              <p class="text-xs text-slate-500 mb-2 uppercase tracking-wider">Statut des cours</p>
              <div class="flex gap-2">
                <div class="flex-1 bg-teal-50 rounded-lg p-2 text-center">
                  <p class="text-lg font-bold text-edaara-primary">{{ stats()!.published_courses }}</p>
                  <p class="text-xs text-slate-500">Publiés</p>
                </div>
                <div class="flex-1 bg-amber-50 rounded-lg p-2 text-center">
                  <p class="text-lg font-bold text-amber-600">{{ stats()!.pending_courses }}</p>
                  <p class="text-xs text-slate-500">En attente</p>
                </div>
                <div class="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                  <p class="text-lg font-bold text-slate-500">{{ stats()!.draft_courses }}</p>
                  <p class="text-xs text-slate-500">Brouillons</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RECENT DATA ROW -->
        <div class="grid lg:grid-cols-2 gap-4">

          <!-- Derniers utilisateurs inscrits -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-edaara-dark text-sm">Derniers inscrits</h3>
              <a routerLink="/admin/users"
                 class="text-xs text-edaara-primary hover:underline flex items-center gap-0.5">
                Voir tous <mat-icon class="!text-sm">chevron_right</mat-icon>
              </a>
            </div>
            <div class="space-y-2">
              @for (u of stats()!.recent_users ?? []; track u.id) {
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-edaara-primary/10 text-edaara-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {{ (u.prenom[0] + u.nom[0]).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-edaara-dark truncate">{{ u.prenom }} {{ u.nom }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ u.email }}</p>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        [class]="statusClass(u.status)">
                    {{ u.status }}
                  </span>
                </div>
              } @empty {
                <p class="text-sm text-slate-400 text-center py-4">Aucune donnée</p>
              }
            </div>
          </div>

          <!-- Activité récente (audit feed) -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-edaara-dark text-sm">Activité récente</h3>
              <a routerLink="/admin/audit-logs"
                 class="text-xs text-edaara-primary hover:underline flex items-center gap-0.5">
                Logs complets <mat-icon class="!text-sm">chevron_right</mat-icon>
              </a>
            </div>
            <div class="space-y-2.5">
              @for (log of stats()!.recent_logs ?? []; track $index) {
                <div class="flex items-start gap-2.5">
                  <div class="w-6 h-6 rounded-full mt-0.5 flex items-center justify-center flex-shrink-0"
                       [class]="log.statut === 'success' ? 'bg-green-100' : 'bg-red-100'">
                    <mat-icon class="!text-xs"
                              [class]="log.statut === 'success' ? 'text-green-600' : 'text-red-500'">
                      {{ log.statut === 'success' ? 'check' : 'error' }}
                    </mat-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-edaara-dark truncate">{{ log.action }}</p>
                    <p class="text-xs text-slate-400 truncate">
                      {{ log.email }} · {{ log.module }}
                    </p>
                  </div>
                  <span class="text-xs text-slate-400 flex-shrink-0">
                    {{ log.created_at | date:'HH:mm' }}
                  </span>
                </div>
              } @empty {
                <p class="text-sm text-slate-400 text-center py-4">Aucune activité</p>
              }
            </div>
          </div>
        </div>

        <!-- QUICK ACTIONS -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a routerLink="/admin/audit-logs"
             class="bg-edaara-dark text-white rounded-xl p-5 hover:bg-slate-800 transition-colors flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <mat-icon>security</mat-icon>
            </div>
            <div>
              <p class="font-semibold">Logs d'audit</p>
              <p class="text-xs text-slate-400 mt-0.5">Traçabilité complète — souveraineté numérique</p>
            </div>
          </a>
          <a routerLink="/admin/courses-pending"
             class="rounded-xl p-5 hover:opacity-90 transition-opacity flex items-center gap-4 text-white"
             [class]="stats()!.pending_courses > 0 ? 'bg-amber-500' : 'bg-edaara-primary'">
            <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 relative">
              <mat-icon>verified</mat-icon>
              @if (stats()!.pending_courses > 0) {
                <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {{ stats()!.pending_courses }}
                </span>
              }
            </div>
            <div>
              <p class="font-semibold">Validation cours</p>
              <p class="text-xs text-white/70 mt-0.5">
                @if (stats()!.pending_courses > 0) {
                  {{ stats()!.pending_courses }} cours en attente de révision
                } @else {
                  Aucun cours en attente
                }
              </p>
            </div>
          </a>
          <a routerLink="/admin/gdpr"
             class="bg-edaara-accent text-white rounded-xl p-5 hover:opacity-90 transition-opacity flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <mat-icon>privacy_tip</mat-icon>
            </div>
            <div>
              <p class="font-semibold">RGPD / CDP</p>
              <p class="text-xs text-amber-100 mt-0.5">Loi sénégalaise n°2008-12</p>
            </div>
          </a>
        </div>

      } @else {
        <div class="text-center py-16 text-slate-500">
          <mat-icon class="!w-16 !h-16 !text-6xl text-slate-300">error_outline</mat-icon>
          <p class="mt-3">Impossible de charger le tableau de bord.</p>
          <button mat-flat-button color="primary" (click)="refresh()" class="mt-4">Réessayer</button>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly stats = signal<AdminDashboardStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly circum = C.toFixed(2);

  protected readonly completionRate = computed(() => {
    const s = this.stats();
    if (!s || s.total_enrollments === 0) return 0;
    return Math.round((s.completed_enrollments / s.total_enrollments) * 100);
  });

  protected readonly donutSegments = computed(() => {
    const s = this.stats();
    if (!s || s.total_users === 0) return [];
    const total = s.total_users;
    const items = [
      { label: 'Actifs', value: s.active_users, color: '#0d9488' },
      { label: 'Inactifs', value: s.inactive_users ?? 0, color: '#94a3b8' },
      { label: 'Suspendus', value: s.suspended_users ?? 0, color: '#ef4444' },
    ];
    let acc = 0;
    return items.map(item => {
      const len = (item.value / total) * C;
      const offset = C * 0.25 - acc;
      acc += len;
      return {
        ...item,
        len: +len.toFixed(2),
        offset: +offset.toFixed(2),
        pct: Math.round((item.value / total) * 100)
      };
    });
  });

  protected readonly barChartData = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const maxVal = Math.max(s.total_users, s.total_enrollments, s.total_quiz_submissions, 1);
    return [
      {
        label: 'Utilisateurs actifs / total',
        value: s.active_users,
        total: s.total_users,
        pct: Math.round((s.active_users / Math.max(s.total_users, 1)) * 100),
        color: '#0d9488'
      },
      {
        label: 'Inscriptions',
        value: s.total_enrollments,
        total: null,
        pct: Math.round((s.total_enrollments / maxVal) * 100),
        color: '#f59e0b'
      },
      {
        label: 'Cours complétés / inscrits',
        value: s.completed_enrollments,
        total: s.total_enrollments,
        pct: Math.round((s.completed_enrollments / Math.max(s.total_enrollments, 1)) * 100),
        color: '#10b981'
      },
      {
        label: 'Quiz passés',
        value: s.total_quiz_submissions,
        total: null,
        pct: Math.round((s.total_quiz_submissions / maxVal) * 100),
        color: '#8b5cf6'
      },
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  refresh(): void {
    this.loading.set(true);
    this.load();
  }

  private load(): void {
    this.admin.dashboard().subscribe({
      next: (res) => {
        this.stats.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  statusClass(s: string): string {
    return ({
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-slate-100 text-slate-600',
      suspended: 'bg-red-100 text-red-600',
      pending: 'bg-amber-100 text-amber-700'
    } as Record<string, string>)[s] ?? 'bg-slate-100 text-slate-600';
  }
}
