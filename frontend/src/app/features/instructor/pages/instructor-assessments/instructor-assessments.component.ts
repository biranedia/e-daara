import {
  ChangeDetectionStrategy, Component, OnInit,
  inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssessmentService } from '@core/services/assessment.service';
import { CourseService } from '@core/services/course.service';
import { Assessment, Course } from '@core/models';

@Component({
  selector: 'app-instructor-assessments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="space-y-5">

      <!-- ── En-tête ── -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Quiz & Évaluations</h1>
          <p class="text-slate-500 text-sm">
            {{ filtered().length }} quiz · {{ assessments().length }} au total
          </p>
        </div>
      </header>

      <!-- ── Formulaire création ── -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 class="font-semibold text-edaara-dark mb-4 flex items-center gap-2">
          <mat-icon class="text-edaara-primary">add_circle</mat-icon>
          Nouveau quiz
        </h3>

        <div class="grid sm:grid-cols-2 gap-3 mb-3">

          <!-- Sélecteur cours (obligatoire) -->
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Cours associé *</mat-label>
            <mat-select [ngModel]="newCourseId()" (ngModelChange)="newCourseId.set($event)">
              @if (courses().length === 0) {
                <mat-option disabled>Aucun cours disponible</mat-option>
              }
              @for (c of courses(); track c.id) {
                <mat-option [value]="c.id">{{ c.titre }}</mat-option>
              }
            </mat-select>
            @if (courses().length === 0) {
              <mat-hint class="text-amber-600">Créez d'abord un cours</mat-hint>
            }
          </mat-form-field>

          <!-- Titre -->
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Titre du quiz *</mat-label>
            <input matInput
                   [ngModel]="newTitle()"
                   (ngModelChange)="newTitle.set($event)"
                   placeholder="Ex : Quiz chapitre 1" />
          </mat-form-field>
        </div>

        <!-- Paramètres optionnels -->
        <div class="grid sm:grid-cols-3 gap-3 mb-4">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Type</mat-label>
            <mat-select [ngModel]="newType()" (ngModelChange)="newType.set($event)">
              <mat-option value="quiz">Quiz</mat-option>
              <mat-option value="examen">Examen</mat-option>
              <mat-option value="devoir">Devoir</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Score max</mat-label>
            <input matInput type="number" min="1"
                   [ngModel]="newScoreMax()"
                   (ngModelChange)="newScoreMax.set(+$event)" />
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Score de passage</mat-label>
            <input matInput type="number" min="1"
                   [ngModel]="newScorePassage()"
                   (ngModelChange)="newScorePassage.set(+$event)" />
          </mat-form-field>
        </div>

        <div class="flex justify-end">
          <button mat-flat-button color="primary"
                  (click)="create()"
                  [disabled]="!canCreate() || creating()">
            @if (creating()) {
              <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner>
            } @else {
              <mat-icon>add</mat-icon>
            }
            Créer le quiz
          </button>
        </div>

        @if (createError()) {
          <p class="text-sm text-red-600 mt-2 flex items-center gap-1">
            <mat-icon class="!text-sm">error_outline</mat-icon>
            {{ createError() }}
          </p>
        }
      </div>

      <!-- ── Filtre par cours ── -->
      @if (courses().length > 1) {
        <div class="flex flex-wrap gap-2">
          <button (click)="filterCourseId.set(null)"
                  class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  [class]="filterCourseId() === null
                    ? 'bg-edaara-primary text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'">
            Tous les cours
          </button>
          @for (c of courses(); track c.id) {
            <button (click)="filterCourseId.set(c.id)"
                    class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                    [class]="filterCourseId() === c.id
                      ? 'bg-edaara-primary text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'">
              {{ c.titre }}
            </button>
          }
        </div>
      }

      <!-- ── Liste des quiz ── -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (filtered().length === 0) {
        <div class="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
          <mat-icon class="!w-14 !h-14 !text-5xl text-slate-300">quiz</mat-icon>
          <p class="text-slate-500 mt-3">
            {{ assessments().length === 0
                ? 'Aucun quiz créé. Commencez par sélectionner un cours ci-dessus.'
                : 'Aucun quiz pour ce cours.' }}
          </p>
        </div>
      } @else {
        <div class="grid sm:grid-cols-2 gap-3">
          @for (a of filtered(); track a.id) {
            <a [routerLink]="['/instructor/assessments', a.id]"
               class="bg-white rounded-xl p-5 shadow-sm border border-slate-100
                      hover:shadow-md hover:border-edaara-primary/30 transition-all group">

              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">

                  <!-- Badge cours -->
                  @if (a.course_titre) {
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                 bg-blue-50 text-blue-700 text-xs font-medium mb-2">
                      <mat-icon class="!text-xs">menu_book</mat-icon>
                      {{ a.course_titre }}
                    </span>
                  }

                  <!-- Titre quiz -->
                  <h3 class="font-semibold text-edaara-dark group-hover:text-edaara-primary
                             transition-colors truncate">
                    {{ a.titre }}
                  </h3>

                  <!-- Méta -->
                  <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                    <span class="flex items-center gap-1">
                      <mat-icon class="!text-xs">star</mat-icon>
                      Score max {{ a.score_max ?? 100 }}
                    </span>
                    <span class="flex items-center gap-1">
                      <mat-icon class="!text-xs">check_circle</mat-icon>
                      Passage {{ a.score_passage ?? 70 }}
                    </span>
                    @if (a.tentatives_max) {
                      <span class="flex items-center gap-1">
                        <mat-icon class="!text-xs">replay</mat-icon>
                        {{ a.tentatives_max }} tentative(s)
                      </span>
                    }
                    @if (a.duree_minutes) {
                      <span class="flex items-center gap-1">
                        <mat-icon class="!text-xs">timer</mat-icon>
                        {{ a.duree_minutes }} min
                      </span>
                    }
                  </div>
                </div>

                <!-- Statut + icône -->
                <div class="flex flex-col items-end gap-2 flex-shrink-0">
                  <mat-icon class="text-edaara-primary group-hover:scale-110 transition-transform">
                    quiz
                  </mat-icon>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="a.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'">
                    {{ a.status === 'published' ? 'Publié' : 'Brouillon' }}
                  </span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class InstructorAssessmentsComponent implements OnInit {
  private readonly assessmentService = inject(AssessmentService);
  private readonly courseService     = inject(CourseService);
  private readonly snack             = inject(MatSnackBar);

  // ─── Données ──────────────────────────────────────────────────────────────
  protected readonly assessments = signal<Assessment[]>([]);
  protected readonly courses     = signal<Course[]>([]);
  protected readonly loading     = signal(true);

  // ─── Filtre liste ─────────────────────────────────────────────────────────
  protected readonly filterCourseId = signal<number | null>(null);

  protected readonly filtered = computed(() => {
    const cid = this.filterCourseId();
    const all = this.assessments();
    if (cid === null) return all;
    return all.filter(a => a.course_id === cid);
  });

  // ─── Formulaire création ──────────────────────────────────────────────────
  protected readonly newCourseId   = signal<number | null>(null);
  protected readonly newTitle      = signal('');
  protected readonly newType       = signal<'quiz' | 'examen' | 'devoir'>('quiz');
  protected readonly newScoreMax   = signal(100);
  protected readonly newScorePassage = signal(70);
  protected readonly creating      = signal(false);
  protected readonly createError   = signal<string | null>(null);

  protected readonly canCreate = computed(() =>
    !!this.newCourseId() && this.newTitle().trim().length > 0
  );

  // ─── Init ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadCourses();
    this.loadAssessments();
  }

  private loadCourses(): void {
    this.courseService.listMine().subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
  }

  private loadAssessments(): void {
    this.loading.set(true);
    this.assessmentService.list().subscribe({
      next: (res) => {
        this.assessments.set(res.data?.assessments ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // ─── Création ─────────────────────────────────────────────────────────────
  create(): void {
    if (!this.canCreate() || this.creating()) return;

    this.creating.set(true);
    this.createError.set(null);

    this.assessmentService.create({
      course_id:    this.newCourseId()!,
      titre:        this.newTitle().trim(),
      type:         this.newType(),
      score_max:    this.newScoreMax(),
      score_passage: this.newScorePassage(),
      tentatives_max: 3,
      status:       'draft'
    }).subscribe({
      next: () => {
        // Reset formulaire
        this.newTitle.set('');
        this.newType.set('quiz');
        this.newScoreMax.set(100);
        this.newScorePassage.set(70);
        this.creating.set(false);
        this.snack.open('Quiz créé avec succès', 'OK', { duration: 2000 });
        this.loadAssessments();
      },
      error: (err) => {
        this.creating.set(false);
        this.createError.set(err?.error?.message ?? 'Erreur lors de la création');
      }
    });
  }
}
