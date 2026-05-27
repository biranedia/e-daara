import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { PathService, CourseInPath } from '@core/services/path.service';
import { CourseService } from '@core/services/course.service';
import { Course, Path } from '@core/models';

interface PathWithCourses extends Path {
  courses: CourseInPath[];
  loadedCourses: boolean;
}

@Component({
  selector: 'app-instructor-paths',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTooltipModule, MatChipsModule
  ],
  template: `
    <div class="space-y-6">

      <!-- ══ EN-TÊTE ══ -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark flex items-center gap-2">
            <mat-icon class="text-edaara-primary">route</mat-icon>
            Mes parcours & cours
          </h1>
          <p class="text-slate-500 text-sm">Organisez vos cours en parcours d'apprentissage guidés</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button mat-stroked-button (click)="goToNewCourse()">
            <mat-icon>add</mat-icon> Nouveau cours
          </button>
          <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
            <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
            {{ showForm() ? 'Fermer' : 'Nouveau parcours' }}
          </button>
        </div>
      </header>

      <!-- ══ FORMULAIRE CRÉATION / ÉDITION PARCOURS ══ -->
      @if (showForm()) {
        <div class="bg-white rounded-xl shadow-sm border border-edaara-primary/30 p-6">
          <h3 class="font-semibold text-edaara-dark mb-4">
            {{ editingId() ? 'Modifier le parcours' : 'Nouveau parcours' }}
          </h3>
          <form [formGroup]="pathForm" (ngSubmit)="savePath()" class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full sm:col-span-2">
                <mat-label>Titre du parcours *</mat-label>
                <input matInput formControlName="titre" placeholder="Ex: Développeur Web Full-Stack" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full sm:col-span-2">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"
                  placeholder="Décrivez ce que l'apprenant saura faire à la fin…"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full sm:col-span-2">
                <mat-label>Objectifs pédagogiques</mat-label>
                <textarea matInput formControlName="objectifs" rows="2"
                  placeholder="Compétences acquises, technologies maîtrisées…"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full sm:col-span-2">
                <mat-label>Prérequis</mat-label>
                <textarea matInput formControlName="prerequis" rows="2"
                  placeholder="Notions de base attendues…"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Niveau</mat-label>
                <mat-select formControlName="niveau">
                  <mat-option value="debutant">Débutant</mat-option>
                  <mat-option value="intermediaire">Intermédiaire</mat-option>
                  <mat-option value="avance">Avancé</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Durée estimée (heures)</mat-label>
                <input matInput type="number" formControlName="duree_estimee" min="0" />
              </mat-form-field>
            </div>
            <div class="flex gap-2 justify-end border-t border-slate-100 pt-4">
              <button mat-button type="button" (click)="cancelForm()">Annuler</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="pathForm.invalid || saving()">
                <mat-icon>save</mat-icon>
                {{ saving() ? 'Enregistrement…' : (editingId() ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- ══ ONGLETS ══ -->
      <div class="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button (click)="activeTab.set('paths')"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                [class.bg-white]="activeTab() === 'paths'"
                [class.shadow-sm]="activeTab() === 'paths'"
                [class.text-edaara-dark]="activeTab() === 'paths'"
                [class.text-slate-500]="activeTab() !== 'paths'">
          <mat-icon class="!text-base align-middle mr-1">route</mat-icon>
          Parcours ({{ paths().length }})
        </button>
        <button (click)="activeTab.set('courses')"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                [class.bg-white]="activeTab() === 'courses'"
                [class.shadow-sm]="activeTab() === 'courses'"
                [class.text-edaara-dark]="activeTab() === 'courses'"
                [class.text-slate-500]="activeTab() !== 'courses'">
          <mat-icon class="!text-base align-middle mr-1">menu_book</mat-icon>
          Mes cours ({{ myCourses().length }})
        </button>
      </div>

      <!-- ══════════ ONGLET PARCOURS ══════════ -->
      @if (activeTab() === 'paths') {
        @if (paths().length === 0) {
          <div class="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
            <mat-icon class="!text-5xl text-slate-300">route</mat-icon>
            <p class="text-slate-500 mt-3 mb-4">Aucun parcours pour l'instant.</p>
            <button mat-flat-button color="primary" (click)="showForm.set(true)">
              <mat-icon>add</mat-icon> Créer mon premier parcours
            </button>
          </div>
        } @else {
          <div class="space-y-4">
            @for (p of paths(); track p.id) {
              <article class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">

                <!-- En-tête carte parcours -->
                <div class="p-5 flex items-start gap-4">
                  <!-- Icône -->
                  <div class="w-12 h-12 rounded-xl bg-edaara-primary/10 flex items-center justify-center flex-shrink-0">
                    <mat-icon class="text-edaara-primary">route</mat-icon>
                  </div>

                  <!-- Infos -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 class="font-semibold text-edaara-dark text-base">{{ p.titre }}</h3>
                        @if (p.description) {
                          <p class="text-sm text-slate-500 mt-0.5 line-clamp-2">{{ p.description }}</p>
                        }
                      </div>
                      <!-- Badge statut -->
                      <span class="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            [class.bg-yellow-100]="p.status === 'draft'"
                            [class.text-yellow-700]="p.status === 'draft'"
                            [class.bg-green-100]="p.status === 'published'"
                            [class.text-green-700]="p.status === 'published'"
                            [class.bg-slate-100]="p.status === 'archived'"
                            [class.text-slate-600]="p.status === 'archived'">
                        {{ statusLabel(p.status) }}
                      </span>
                    </div>

                    <!-- Métadonnées -->
                    <div class="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      @if (p.niveau) {
                        <span class="flex items-center gap-1">
                          <mat-icon class="!text-xs">signal_cellular_alt</mat-icon>
                          {{ niveauLabel(p.niveau) }}
                        </span>
                      }
                      @if (p.duree_estimee) {
                        <span class="flex items-center gap-1">
                          <mat-icon class="!text-xs">schedule</mat-icon>
                          {{ p.duree_estimee }} h
                        </span>
                      }
                      <span class="flex items-center gap-1">
                        <mat-icon class="!text-xs">menu_book</mat-icon>
                        {{ p.nb_cours ?? 0 }} cours
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-1 flex-shrink-0">
                    @if (p.status === 'draft') {
                      <button mat-icon-button (click)="publishPath(p)" matTooltip="Publier">
                        <mat-icon class="!text-green-600">publish</mat-icon>
                      </button>
                    }
                    @if (p.status === 'published') {
                      <button mat-icon-button (click)="unpublishPath(p)" matTooltip="Dépublier (repasser en brouillon)">
                        <mat-icon class="!text-orange-500">unpublished</mat-icon>
                      </button>
                    }
                    <button mat-icon-button (click)="openEdit(p)" matTooltip="Modifier">
                      <mat-icon class="!text-slate-500">edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="toggleCourses(p)" matTooltip="Gérer les cours">
                      <mat-icon class="!text-edaara-primary">playlist_add</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deletePath(p)" matTooltip="Supprimer">
                      <mat-icon class="!text-red-400">delete</mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Panneau gestion cours (dépliable) -->
                @if (expandedPathId() === p.id) {
                  <div class="border-t border-slate-100 bg-slate-50/60">
                    @if (loadingCourses()) {
                      <div class="p-4 flex items-center gap-2 text-slate-500 text-sm">
                        <span class="w-4 h-4 border-2 border-edaara-primary border-t-transparent rounded-full animate-spin"></span>
                        Chargement…
                      </div>
                    } @else {
                      <div class="p-4 space-y-3">
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Cours dans ce parcours ({{ pathCoursesMap().get(p.id)?.length ?? 0 }})
                        </p>

                        <!-- Liste des cours du parcours -->
                        @if ((pathCoursesMap().get(p.id) ?? []).length === 0) {
                          <p class="text-sm text-slate-400 italic">Aucun cours associé à ce parcours.</p>
                        }
                        <div class="space-y-2">
                          @for (c of pathCoursesMap().get(p.id) ?? []; track c.id; let i = $index) {
                            <div class="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-3">
                              <span class="text-xs text-slate-400 font-mono w-5">{{ i + 1 }}</span>
                              <mat-icon class="!text-base text-slate-400 flex-shrink-0">{{ courseIcon(c) }}</mat-icon>
                              <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-edaara-dark truncate">{{ c.titre }}</p>
                                @if (c.niveau) {
                                  <p class="text-xs text-slate-400">{{ niveauLabel(c.niveau) }}</p>
                                }
                              </div>
                              <div class="flex items-center gap-1">
                                <button mat-icon-button [disabled]="i === 0" (click)="moveUp(p.id, i)"
                                        matTooltip="Monter" class="!w-7 !h-7">
                                  <mat-icon class="!text-sm">arrow_upward</mat-icon>
                                </button>
                                <button mat-icon-button
                                        [disabled]="i === (pathCoursesMap().get(p.id)?.length ?? 1) - 1"
                                        (click)="moveDown(p.id, i)" matTooltip="Descendre" class="!w-7 !h-7">
                                  <mat-icon class="!text-sm">arrow_downward</mat-icon>
                                </button>
                                <button mat-icon-button (click)="removeCourseFromPath(p.id, c.id)"
                                        matTooltip="Retirer" class="!w-7 !h-7">
                                  <mat-icon class="!text-sm !text-red-400">remove_circle</mat-icon>
                                </button>
                              </div>
                            </div>
                          }
                        </div>

                        <!-- Ajouter un cours au parcours -->
                        <div class="flex gap-2 pt-2 border-t border-slate-100">
                          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
                            <mat-label>Ajouter un cours</mat-label>
                            <mat-icon matPrefix>add</mat-icon>
                            <mat-select [(ngModel)]="selectedCourseToAdd[p.id]">
                              <mat-option [value]="null">-- Choisir un cours --</mat-option>
                              @for (c of availableCoursesForPath(p.id); track c.id) {
                                <mat-option [value]="c.id">{{ c.titre }}</mat-option>
                              }
                              @if (availableCoursesForPath(p.id).length === 0) {
                                <mat-option disabled>Tous vos cours sont déjà dans ce parcours</mat-option>
                              }
                            </mat-select>
                          </mat-form-field>
                          <button mat-flat-button color="primary"
                                  [disabled]="!selectedCourseToAdd[p.id]"
                                  (click)="addCourseToPath(p.id)">
                            <mat-icon>add</mat-icon> Ajouter
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }

              </article>
            }
          </div>
        }
      }

      <!-- ══════════ ONGLET MES COURS ══════════ -->
      @if (activeTab() === 'courses') {
        <div class="space-y-3">
          <!-- Barre d'action -->
          <div class="flex justify-between items-center">
            <p class="text-slate-500 text-sm">
              {{ myCourses().length }} cours au total
            </p>
            <button mat-flat-button color="primary" (click)="goToNewCourse()">
              <mat-icon>add</mat-icon> Nouveau cours
            </button>
          </div>

          @if (myCourses().length === 0) {
            <div class="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
              <mat-icon class="!text-5xl text-slate-300">menu_book</mat-icon>
              <p class="text-slate-500 mt-3 mb-4">Vous n'avez pas encore de cours.</p>
            </div>
          } @else {
            <div class="grid sm:grid-cols-2 gap-3">
              @for (c of myCourses(); track c.id) {
                <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex gap-3">
                  <!-- Icône statut -->
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                       [class.bg-yellow-50]="c.status === 'draft'"
                       [class.bg-blue-50]="c.status === 'pending'"
                       [class.bg-green-50]="c.status === 'published'"
                       [class.bg-slate-50]="c.status === 'archived'">
                    <mat-icon [class.text-yellow-500]="c.status === 'draft'"
                              [class.text-blue-500]="c.status === 'pending'"
                              [class.text-green-600]="c.status === 'published'"
                              [class.text-slate-400]="c.status === 'archived'">
                      menu_book
                    </mat-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm text-edaara-dark truncate">{{ c.titre }}</p>
                    <div class="flex gap-2 mt-1 flex-wrap">
                      <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                            [class.bg-yellow-100]="c.status === 'draft'"
                            [class.text-yellow-700]="c.status === 'draft'"
                            [class.bg-blue-100]="c.status === 'pending'"
                            [class.text-blue-700]="c.status === 'pending'"
                            [class.bg-green-100]="c.status === 'published'"
                            [class.text-green-700]="c.status === 'published'"
                            [class.bg-slate-100]="c.status === 'archived'"
                            [class.text-slate-600]="c.status === 'archived'">
                        {{ statusLabel(c.status) }}
                      </span>
                      @if (coursePathName(c.id); as pname) {
                        <span class="text-xs text-edaara-primary bg-edaara-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <mat-icon class="!text-[10px]">route</mat-icon>
                          {{ pname }}
                        </span>
                      }
                    </div>
                  </div>
                  <div class="flex gap-1 flex-shrink-0">
                    <a mat-icon-button [routerLink]="['/instructor/courses', c.id]" matTooltip="Modifier">
                      <mat-icon class="!text-sm !text-slate-400">edit</mat-icon>
                    </a>
                    <a mat-icon-button [routerLink]="['/instructor/courses', c.id, 'sections']" matTooltip="Sections & leçons">
                      <mat-icon class="!text-sm !text-slate-400">list</mat-icon>
                    </a>
                    <button mat-icon-button (click)="confirmDeleteCourse(c)" matTooltip="Supprimer ce cours">
                      <mat-icon class="!text-sm !text-red-400">delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

    </div>

    <!-- ══ MODALE SUPPRESSION PARCOURS ══ -->
    @if (deletePathConfirm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-red-500">warning</mat-icon>
            </div>
            <div>
              <h3 class="font-semibold text-edaara-dark">Supprimer le parcours ?</h3>
              <p class="text-sm text-slate-500 mt-0.5">{{ deletePathConfirm()!.titre }}</p>
            </div>
          </div>
          <p class="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
            Les cours associés <strong>ne seront pas supprimés</strong>, ils seront simplement retirés du parcours.
          </p>
          <div class="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <button mat-button (click)="deletePathConfirm.set(null)">Annuler</button>
            <button mat-flat-button color="warn" (click)="confirmDeletePath()">
              <mat-icon>delete</mat-icon> Supprimer
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ══ MODALE SUPPRESSION COURS ══ -->
    @if (deleteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-red-500">warning</mat-icon>
            </div>
            <div>
              <h3 class="font-semibold text-edaara-dark">Supprimer le cours ?</h3>
              <p class="text-sm text-slate-500 mt-0.5">{{ deleteModal()!.course.titre }}</p>
            </div>
          </div>

          @if (deleteModal()!.loadingPaths) {
            <div class="flex items-center gap-2 text-slate-500 text-sm py-2">
              <span class="w-4 h-4 border-2 border-edaara-primary border-t-transparent rounded-full animate-spin"></span>
              Vérification des parcours associés…
            </div>
          } @else if (deleteModal()!.paths.length > 0) {
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <p class="text-sm font-medium text-amber-800 flex items-center gap-2">
                <mat-icon class="!text-base">info</mat-icon>
                Ce cours est lié aux parcours suivants :
              </p>
              <ul class="space-y-1">
                @for (path of deleteModal()!.paths; track path.id) {
                  <li class="text-sm text-amber-700 flex items-center gap-2">
                    <mat-icon class="!text-xs">route</mat-icon>
                    {{ path.titre }}
                  </li>
                }
              </ul>
              <p class="text-xs text-amber-600 mt-2">
                Il sera automatiquement retiré de ces parcours lors de la suppression.
              </p>
            </div>
          } @else {
            <p class="text-sm text-slate-600">
              Cette action est irréversible. Les sections et leçons associées seront également supprimées.
            </p>
          }

          <div class="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <button mat-button (click)="deleteModal.set(null)">Annuler</button>
            <button mat-flat-button color="warn"
                    [disabled]="deleteModal()!.loadingPaths || deleting()"
                    (click)="executeCourseDelete()">
              <mat-icon>delete</mat-icon>
              {{ deleting() ? 'Suppression…' : 'Supprimer définitivement' }}
            </button>
          </div>
        </div>
      </div>
    }

  `
})
export class InstructorPathsComponent implements OnInit {
  private readonly pathService  = inject(PathService);
  private readonly courseService = inject(CourseService);
  private readonly fb           = inject(FormBuilder);
  private readonly snack        = inject(MatSnackBar);

  // ── State ──────────────────────────────────────────────────────────────────
  protected readonly paths          = signal<PathWithCourses[]>([]);
  protected readonly myCourses      = signal<Course[]>([]);
  protected readonly expandedPathId = signal<number | null>(null);
  protected readonly loadingCourses = signal(false);
  protected readonly pathCoursesMap = signal(new Map<number, CourseInPath[]>());
  protected readonly activeTab      = signal<'paths' | 'courses'>('paths');
  protected readonly showForm       = signal(false);
  protected readonly editingId      = signal<number | null>(null);
  protected readonly saving         = signal(false);

  // key = pathId, value = selected courseId to add
  protected selectedCourseToAdd: Record<number, number | null> = {};

  protected readonly deleteModal = signal<{
    course: Course;
    paths: { id: number; titre: string }[];
    loadingPaths: boolean;
  } | null>(null);
  protected readonly deleting          = signal(false);
  protected readonly deletePathConfirm = signal<PathWithCourses | null>(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  protected readonly pathForm = this.fb.nonNullable.group({
    titre:        ['', [Validators.required, Validators.minLength(3)]],
    description:  [''],
    objectifs:    [''],
    prerequis:    [''],
    niveau:       ['debutant'],
    duree_estimee:[0]
  });

  ngOnInit(): void {
    this.loadPaths();
    this.loadCourses();
  }

  // ── Chargement ──────────────────────────────────────────────────────────
  loadPaths(): void {
    this.pathService.list().subscribe({
      next: (res) => {
        const list = (res.data?.paths ?? []).map(p => ({
          ...p, courses: [], loadedCourses: false
        } as PathWithCourses));
        this.paths.set(list);
      }
    });
  }

  loadCourses(): void {
    this.courseService.listMine().subscribe({
      next: (res) => this.myCourses.set(res.data?.courses ?? [])
    });
  }

  // ── Parcours CRUD ─────────────────────────────────────────────────────────
  openEdit(p: PathWithCourses): void {
    this.editingId.set(p.id);
    this.pathForm.patchValue({
      titre:         p.titre ?? '',
      description:   p.description ?? '',
      objectifs:     (p as any).objectifs ?? '',
      prerequis:     (p as any).prerequis ?? '',
      niveau:        p.niveau ?? 'debutant',
      duree_estimee: p.duree_estimee ?? 0
    });
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.pathForm.reset({ niveau: 'debutant', duree_estimee: 0 });
  }

  savePath(): void {
    if (this.pathForm.invalid) return;
    this.saving.set(true);
    const raw = this.pathForm.getRawValue();
    const obs = this.editingId()
      ? this.pathService.update(this.editingId()!, raw as any)
      : this.pathService.create(raw as any);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.editingId() ? 'Parcours modifié' : 'Parcours créé', 'OK', { duration: 2000 });
        this.cancelForm();
        this.loadPaths();
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 });
      }
    });
  }

  deletePath(p: PathWithCourses): void {
    this.deletePathConfirm.set(p);
  }

  confirmDeletePath(): void {
    const p = this.deletePathConfirm();
    if (!p) return;
    this.pathService.delete(p.id).subscribe({
      next: () => {
        this.deletePathConfirm.set(null);
        this.snack.open('Parcours supprimé', 'OK', { duration: 2000 });
        if (this.expandedPathId() === p.id) this.expandedPathId.set(null);
        this.loadPaths();
      },
      error: (err) => {
        this.deletePathConfirm.set(null);
        this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 });
      }
    });
  }

  publishPath(p: PathWithCourses): void {
    this.pathService.update(p.id, { status: 'published' }).subscribe({
      next: () => {
        this.snack.open('Parcours publié', 'OK', { duration: 2000 });
        this.loadPaths();
      }
    });
  }

  unpublishPath(p: PathWithCourses): void {
    this.pathService.update(p.id, { status: 'draft' }).subscribe({
      next: () => {
        this.snack.open('Parcours repassé en brouillon', 'OK', { duration: 2000 });
        this.loadPaths();
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  confirmDeleteCourse(course: Course): void {
    this.deleteModal.set({ course, paths: [], loadingPaths: true });
    this.courseService.getCoursePaths(course.id).subscribe({
      next: (res) => {
        const paths = res.data?.paths ?? [];
        this.deleteModal.update(m => m ? { ...m, paths, loadingPaths: false } : null);
      },
      error: () => {
        this.deleteModal.update(m => m ? { ...m, paths: [], loadingPaths: false } : null);
      }
    });
  }

  executeCourseDelete(): void {
    const modal = this.deleteModal();
    if (!modal) return;
    this.deleting.set(true);
    this.courseService.delete(modal.course.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModal.set(null);
        this.snack.open('Cours supprimé', 'OK', { duration: 2000 });
        this.loadCourses();
        this.loadPaths();
        // Refresh courses for any expanded path that contained this course
        for (const [pathId, courses] of this.pathCoursesMap()) {
          if (courses.some(c => c.id === modal.course.id)) {
            this.loadPathCourses(pathId);
          }
        }
      },
      error: (err) => {
        this.deleting.set(false);
        this.snack.open(err?.error?.message ?? 'Erreur lors de la suppression', 'OK', { duration: 3000 });
      }
    });
  }

  // ── Gestion cours dans un parcours ────────────────────────────────────────
  toggleCourses(p: PathWithCourses): void {
    if (this.expandedPathId() === p.id) {
      this.expandedPathId.set(null);
      return;
    }
    this.expandedPathId.set(p.id);
    if (!this.pathCoursesMap().has(p.id)) {
      this.loadPathCourses(p.id);
    }
  }

  loadPathCourses(pathId: number): void {
    this.loadingCourses.set(true);
    this.pathService.get(pathId).subscribe({
      next: (res) => {
        const courses = res.data?.courses ?? [];
        this.pathCoursesMap.update(m => { const nm = new Map(m); nm.set(pathId, courses); return nm; });
        this.loadingCourses.set(false);
      },
      error: () => this.loadingCourses.set(false)
    });
  }

  availableCoursesForPath(pathId: number): Course[] {
    const inPath = new Set((this.pathCoursesMap().get(pathId) ?? []).map(c => c.id));
    return this.myCourses().filter(c => !inPath.has(c.id));
  }

  addCourseToPath(pathId: number): void {
    const courseId = this.selectedCourseToAdd[pathId];
    if (!courseId) return;
    const ordre = (this.pathCoursesMap().get(pathId)?.length ?? 0) + 1;
    this.pathService.addCourse(pathId, courseId, ordre).subscribe({
      next: () => {
        this.selectedCourseToAdd[pathId] = null;
        this.snack.open('Cours ajouté au parcours', 'OK', { duration: 1500 });
        this.loadPathCourses(pathId);
        this.loadPaths();
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  removeCourseFromPath(pathId: number, courseId: number): void {
    this.pathService.removeCourse(pathId, courseId).subscribe({
      next: () => {
        this.snack.open('Cours retiré', 'OK', { duration: 1500 });
        this.loadPathCourses(pathId);
        this.loadPaths();
      }
    });
  }

  moveUp(pathId: number, index: number): void {
    const list = [...(this.pathCoursesMap().get(pathId) ?? [])];
    if (index === 0) return;
    [list[index - 1], list[index]] = [list[index], list[index - 1]];
    this.applyNewOrder(pathId, list);
  }

  moveDown(pathId: number, index: number): void {
    const list = [...(this.pathCoursesMap().get(pathId) ?? [])];
    if (index >= list.length - 1) return;
    [list[index], list[index + 1]] = [list[index + 1], list[index]];
    this.applyNewOrder(pathId, list);
  }

  private applyNewOrder(pathId: number, list: CourseInPath[]): void {
    this.pathCoursesMap.update(m => { const nm = new Map(m); nm.set(pathId, list); return nm; });
    const course_ids = list.map(c => c.id);
    this.pathService.update(pathId, { course_ids }).subscribe({
      next: () => this.snack.open('Ordre mis à jour', 'OK', { duration: 1200 })
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  coursePathName(courseId: number): string | null {
    for (const [, courses] of this.pathCoursesMap()) {
      if (courses.some(c => c.id === courseId)) {
        const p = this.paths().find(p => this.pathCoursesMap().get(p.id)?.some(c => c.id === courseId));
        return p?.titre ?? null;
      }
    }
    return null;
  }

  goToNewCourse(): void {
    window.location.href = '/instructor/courses/new';
  }

  statusLabel(s?: string): string {
    return { draft: 'Brouillon', published: 'Publié', archived: 'Archivé', pending: 'En attente' }[s ?? ''] ?? s ?? '';
  }

  niveauLabel(n?: string): string {
    return { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' }[n ?? ''] ?? n ?? '';
  }

  courseIcon(c: CourseInPath): string {
    return 'menu_book';
  }
}
