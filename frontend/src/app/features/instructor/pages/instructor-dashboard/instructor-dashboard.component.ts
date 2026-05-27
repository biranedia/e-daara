import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '@core/services/course.service';
import { Course } from '@core/models';

// Helpers for simple SVG charts (no external deps)
function sparklinePath(values: number[], width = 120, height = 36): string {
  if (!values || values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Tableau de bord formateur</h1>
          <p class="text-slate-500">Vue d'ensemble de vos cours et activités</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/instructor/courses/new" class="!h-12">
          <mat-icon>add</mat-icon>
          Nouveau cours
        </a>
      </header>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p class="text-sm text-slate-500">Mes cours</p>
          <p class="text-3xl font-bold text-edaara-dark mt-1">{{ courses().length }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p class="text-sm text-slate-500">Publiés</p>
          <p class="text-3xl font-bold text-green-600 mt-1">{{ countByStatus('published') }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p class="text-sm text-slate-500">En attente</p>
          <p class="text-3xl font-bold text-amber-600 mt-1">{{ countByStatus('pending') }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <p class="text-sm text-slate-500">Brouillons</p>
          <p class="text-3xl font-bold text-slate-500 mt-1">{{ countByStatus('draft') }}</p>
        </div>
      </div>

      <!-- KPIs + charts -->
      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-3">Indicateurs clés</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p class="text-sm text-slate-500">Élèves inscrits (total)</p>
            <p class="text-3xl font-bold text-edaara-dark mt-1">{{ totalStudents() }}</p>
            <p class="text-xs text-slate-400 mt-2">Cours les plus populaires</p>
            <svg width="140" height="40" class="mt-2"><path [attr.d]="topEnrollmentsPath()" stroke="#3b82f6" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>

          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p class="text-sm text-slate-500">Note moyenne</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ avgRating() | number:'1.1-2' }}</p>
            <p class="text-xs text-slate-400 mt-2">Basé sur vos cours publiés</p>
          </div>

          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p class="text-sm text-slate-500">Cours récents (5)</p>
            <p class="text-3xl font-bold text-edaara-dark mt-1">{{ recentCount() }}</p>
            <p class="text-xs text-slate-400 mt-2">Voir activité récente ci-dessous</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-3">Activité récente</h2>
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
          @for (c of courses().slice(0, 5); track c.id) {
            <a [routerLink]="['/instructor/courses', c.id]"
               class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p class="font-medium text-slate-800">{{ c.titre }}</p>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ c.created_at | date:'dd/MM/yyyy' }} · {{ c.status }}
                </p>
              </div>
              <mat-icon class="text-slate-400">chevron_right</mat-icon>
            </a>
          } @empty {
            <p class="text-center py-10 text-slate-500">
              Aucun cours encore. Créez votre premier cours pour commencer.
            </p>
          }
        </div>
      </section>
    </div>
  `
})
export class InstructorDashboardComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  protected readonly courses = signal<Course[]>([]);
  protected readonly totalStudentsSignal = signal<number>(0);
  protected readonly avgRatingSignal = signal<number>(0);
  protected readonly topEnrollmentValues = signal<number[]>([]);

  ngOnInit(): void {
    this.courseService.listMine().subscribe({
      next: (res) => {
        const list = res.data?.courses ?? [];
        this.courses.set(list);
        // compute simple KPIs from returned courses
        const total = list.reduce((s, c) => s + (c.nb_inscrits ?? 0), 0);
        this.totalStudentsSignal.set(total);
        const ratings = list.map(c => c.note_moyenne ?? 0).filter(r => r > 0);
        const avg = ratings.length ? ratings.reduce((a,b) => a+b, 0)/ratings.length : 0;
        this.avgRatingSignal.set(avg);
        const top = list
          .slice()
          .sort((a,b) => (b.nb_inscrits ?? 0) - (a.nb_inscrits ?? 0))
          .slice(0, 6)
          .map(c => c.nb_inscrits ?? 0);
        this.topEnrollmentValues.set(top);
      }
    });
  }

  countByStatus(s: string): number {
    return this.courses().filter((c) => c.status === s).length;
  }

  totalStudents(): number { return this.totalStudentsSignal(); }
  avgRating(): number { return this.avgRatingSignal(); }
  recentCount(): number { return Math.min(5, this.courses().length); }
  topEnrollmentsPath(): string { return sparklinePath(this.topEnrollmentValues(), 140, 40); }
}

// Component methods added below class to avoid long template expressions
