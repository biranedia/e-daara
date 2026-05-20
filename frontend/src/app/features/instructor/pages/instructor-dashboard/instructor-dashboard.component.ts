import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '@core/services/course.service';
import { Course } from '@core/models';

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

  ngOnInit(): void {
    this.courseService.listMine().subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
  }

  countByStatus(s: string): number {
    return this.courses().filter((c) => c.status === s).length;
  }
}
