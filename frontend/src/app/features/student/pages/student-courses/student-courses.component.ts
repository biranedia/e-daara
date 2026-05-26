import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EnrollmentService } from '@core/services/enrollment.service';
import { Enrollment } from '@core/models';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Mes cours</h1>
        <p class="text-slate-500">{{ enrollments().length }} inscription(s)</p>
      </header>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (e of enrollments(); track e.id) {
          <article class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div class="h-32 bg-gradient-to-br from-edaara-primary to-teal-700 flex items-center justify-center">
              <mat-icon class="!w-14 !h-14 !text-6xl text-white/80">school</mat-icon>
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <h3 class="font-bold text-edaara-dark">{{ e.course_titre || ('Cours #' + e.course_id) }}</h3>
              <p class="text-xs text-slate-500 mt-1">
                Inscrit le {{ e.enrolled_at | date:'dd/MM/yyyy' }}
              </p>
              <mat-progress-bar mode="determinate" [value]="e.progression" class="mt-3"></mat-progress-bar>
              <div class="flex justify-between text-xs text-slate-500 mt-2 mb-3">
                <span>{{ e.progression | number:'1.0-0' }}% terminé</span>
                <span class="px-2 py-0.5 rounded" [class]="statusClass(e.status)">{{ e.status }}</span>
              </div>
              <a mat-flat-button color="primary" [routerLink]="['/student/courses', e.course_id]"
                 class="mt-auto">
                @if (e.progression > 0 && e.progression < 100) {
                  Continuer
                } @else if (e.progression === 100) {
                  Revoir
                } @else {
                  Commencer
                }
              </a>
            </div>
          </article>
        } @empty {
          <div class="col-span-full bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
            <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">school</mat-icon>
            <p class="text-slate-600 mt-3">Aucune inscription pour l'instant.</p>
            <a mat-flat-button color="primary" routerLink="/student/catalogue" class="mt-4">
              Découvrir le catalogue
            </a>
          </div>
        }
      </div>
    </div>
  `
})
export class StudentCoursesComponent implements OnInit {
  private readonly enrollment = inject(EnrollmentService);
  protected readonly enrollments = signal<Enrollment[]>([]);

  ngOnInit(): void {
    this.enrollment.listMine().subscribe({
      next: (res) => this.enrollments.set(res.data?.enrollments ?? [])
    });
  }

  statusClass(s: string): string {
    return {
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      paused: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700'
    }[s] ?? 'bg-slate-100 text-slate-700';
  }
}
