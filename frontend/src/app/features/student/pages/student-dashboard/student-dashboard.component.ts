import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EnrollmentService } from '@core/services/enrollment.service';
import { Enrollment, StudentDashboardStats } from '@core/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Mon tableau de bord</h1>
        <p class="text-slate-500">Suivi de votre progression</p>
      </header>

      @if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p class="text-sm text-slate-500">Cours suivis</p>
            <p class="text-3xl font-bold text-edaara-dark mt-1">{{ stats()!.enrolled_courses }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p class="text-sm text-slate-500">Cours terminés</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ stats()!.completed_courses }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p class="text-sm text-slate-500">Parcours</p>
            <p class="text-3xl font-bold text-edaara-primary mt-1">{{ stats()!.enrolled_paths }}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p class="text-sm text-slate-500">Progression moy.</p>
            <p class="text-3xl font-bold text-edaara-accent mt-1">
              {{ stats()!.avg_progression ? (stats()!.avg_progression | number:'1.0-0') : 0 }}%
            </p>
          </div>
        </div>
      }

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-3">Continuer où vous en étiez</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          @for (e of enrollments(); track e.id) {
            <a [routerLink]="['/student/courses', e.course_id]"
               class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h3 class="font-semibold text-edaara-dark">{{ e.course_titre || ('Cours #' + e.course_id) }}</h3>
              <mat-progress-bar mode="determinate" [value]="e.progression" class="mt-3"></mat-progress-bar>
              <div class="flex justify-between text-xs text-slate-500 mt-2">
                <span>{{ e.progression | number:'1.0-0' }}% terminé</span>
                <span>{{ e.status }}</span>
              </div>
            </a>
          } @empty {
            <div class="col-span-full bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
              <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">school</mat-icon>
              <p class="text-slate-600 mt-3">Vous n'êtes inscrit à aucun cours.</p>
              <a mat-flat-button color="primary" routerLink="/student/catalogue" class="mt-4">
                Découvrir le catalogue
              </a>
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
  private readonly enrollment = inject(EnrollmentService);

  protected readonly stats = signal<StudentDashboardStats | null>(null);
  protected readonly enrollments = signal<Enrollment[]>([]);

  ngOnInit(): void {
    this.enrollment.studentDashboard().subscribe({
      next: (res) => this.stats.set(res.data ?? null)
    });
    this.enrollment.listMine().subscribe({
      next: (res) => this.enrollments.set(res.data?.enrollments ?? [])
    });
  }
}
