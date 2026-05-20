import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '@core/services/course.service';
import { EnrollmentService } from '@core/services/enrollment.service';
import { AuthService } from '@core/services/auth.service';
import { Course, Section } from '@core/models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="max-w-5xl mx-auto px-6 py-8 space-y-6">
      @if (course(); as c) {
        <!-- En-tête -->
        <header class="bg-gradient-to-br from-edaara-primary to-teal-700 text-white rounded-2xl p-8">
          <a routerLink="/catalogue" class="text-teal-100 text-sm hover:underline">← Retour au catalogue</a>
          <h1 class="text-3xl md:text-4xl font-bold mt-4">{{ c.titre }}</h1>
          <p class="text-teal-100 mt-2">{{ c.description }}</p>
          <div class="flex flex-wrap gap-4 mt-4 text-sm">
            <span>👤 {{ c.instructor_prenom }} {{ c.instructor_nom }}</span>
            @if (c.niveau) { <span>📊 {{ c.niveau }}</span> }
            @if (c.duree) { <span>⏱ {{ c.duree }} min</span> }
            <span>👥 {{ c.nb_inscrits || 0 }} inscrits</span>
          </div>
        </header>

        <!-- Action principale -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
          <div>
            <p class="font-semibold text-edaara-dark">Ce cours est gratuit</p>
            <p class="text-sm text-slate-500">Accès illimité, certificat à la fin</p>
          </div>
          @if (auth.isAuthenticated()) {
            <button mat-flat-button color="primary" (click)="enroll()" [disabled]="enrolling()" class="!h-12 !px-6">
              <mat-icon>school</mat-icon>
              @if (enrolling()) { Inscription... } @else { Rejoindre le cours }
            </button>
          } @else {
            <a mat-flat-button color="primary" routerLink="/auth/login" class="!h-12 !px-6">
              <mat-icon>login</mat-icon>
              Se connecter pour s'inscrire
            </a>
          }
        </div>

        <!-- Objectifs et prérequis -->
        <div class="grid md:grid-cols-2 gap-4">
          @if (c.objectifs) {
            <article class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 class="font-semibold text-edaara-dark mb-2">🎯 Objectifs</h3>
              <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ c.objectifs }}</p>
            </article>
          }
          @if (c.prerequis) {
            <article class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 class="font-semibold text-edaara-dark mb-2">📋 Prérequis</h3>
              <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ c.prerequis }}</p>
            </article>
          }
        </div>

        <!-- Programme -->
        @if (sections().length > 0) {
          <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 class="font-bold text-edaara-dark mb-4">Programme du cours</h3>
            <ol class="space-y-2">
              @for (s of sections(); track s.id) {
                <li class="flex items-start gap-3 p-3 bg-slate-50 rounded">
                  <span class="w-8 h-8 rounded-full bg-edaara-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {{ s.ordre }}
                  </span>
                  <div>
                    <p class="font-medium text-edaara-dark">{{ s.titre }}</p>
                    @if (s.description) {
                      <p class="text-sm text-slate-600 mt-1">{{ s.description }}</p>
                    }
                  </div>
                </li>
              }
            </ol>
          </section>
        }
      }
    </div>
  `
})
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly enrollment = inject(EnrollmentService);
  private readonly snack = inject(MatSnackBar);
  protected readonly auth = inject(AuthService);

  protected readonly course = signal<Course | null>(null);
  protected readonly sections = signal<Section[]>([]);
  protected readonly enrolling = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseService.getPublicCourse(id).subscribe({
      next: (res) => {
        if (res.data?.course) this.course.set(res.data.course);
        if (res.data?.sections) this.sections.set(res.data.sections);
      }
    });
    // Charger les sections séparément si pas incluses
    this.courseService.listSections(id).subscribe({
      next: (res) => {
        if (res.data?.sections && this.sections().length === 0) {
          this.sections.set(res.data.sections);
        }
      },
      error: () => void 0
    });
  }

  enroll(): void {
    const c = this.course();
    if (!c) return;
    this.enrolling.set(true);
    this.enrollment.enroll(c.id).subscribe({
      next: () => {
        this.enrolling.set(false);
        this.snack.open(`Inscription réussie à "${c.titre}"`, 'OK', { duration: 2500 });
        this.router.navigate(['/student/courses', c.id]);
      },
      error: (err) => {
        this.enrolling.set(false);
        this.snack.open(err?.error?.message ?? "Erreur lors de l'inscription", 'OK', { duration: 3000 });
      }
    });
  }
}
