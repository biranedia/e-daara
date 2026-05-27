import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  OnInit, ViewChild, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '@core/services/course.service';
import { PathService } from '@core/services/path.service';
import { MediaService } from '@core/services/media.service';
import { Course, Path } from '@core/models';

interface CriteriaResult {
  decision: 'approved' | 'rejected';
  message:  string;
  criteria: Array<{ code: string; label: string; passed: boolean }>;
}

@Component({
  selector: 'app-instructor-course-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, MatProgressBarModule
  ],
  styles: [`
    .upload-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all .2s ease;
      background: #f8fafc;
    }
    .upload-zone:hover {
      border-color: var(--edaara-primary, #4f46e5);
      background: rgba(79,70,229,.04);
    }
    .upload-zone.has-image {
      border-style: solid;
      border-color: #e2e8f0;
      padding: .5rem;
      background: white;
    }
  `],
  template: `
    <input #thumbInput type="file" accept="image/jpeg,image/png,image/webp,image/gif"
           class="hidden" (change)="onThumbSelected($event)" />

    <div class="space-y-4 max-w-3xl">

      <!-- En-tête -->
      <header class="flex items-center gap-3">
        <a mat-icon-button routerLink="/instructor/paths" aria-label="Retour">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-2xl font-bold text-edaara-dark">
              {{ id() ? 'Modifier le cours' : 'Nouveau cours' }}
            </h1>
            @if (id() && courseStatus()) {
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                    [class.bg-yellow-100]="courseStatus() === 'draft'"
                    [class.text-yellow-700]="courseStatus() === 'draft'"
                    [class.bg-green-100]="courseStatus() === 'published'"
                    [class.text-green-700]="courseStatus() === 'published'"
                    [class.bg-blue-100]="courseStatus() === 'pending'"
                    [class.text-blue-700]="courseStatus() === 'pending'">
                {{ statusLabel(courseStatus()) }}
              </span>
            }
          </div>
          <p class="text-slate-500 text-sm mt-0.5">Remplissez les informations du cours</p>
        </div>
      </header>

      <!-- Formulaire principal -->
      <form [formGroup]="form" (ngSubmit)="save()"
            class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">

        <!-- ── Image de couverture ── -->
        <div>
          <p class="text-sm font-medium text-slate-700 mb-2">
            Image de couverture
            <span class="text-xs text-red-500 font-normal ml-1">
              * requise pour la publication
            </span>
          </p>

          @if (thumbnailPreview() || form.get('thumbnail')?.value) {
            <!-- Aperçu image -->
            <div class="upload-zone has-image relative group"
                 style="cursor: default; max-width: 320px;">
              <img [src]="thumbnailPreview() || form.get('thumbnail')?.value"
                   class="w-full h-44 object-cover rounded-lg" />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg
                          flex items-center justify-center gap-2 transition-all opacity-0
                          group-hover:opacity-100">
                <button type="button" mat-mini-fab color="primary"
                        (click)="thumbInput.click()" matTooltip="Changer">
                  <mat-icon>swap_horiz</mat-icon>
                </button>
                <button type="button" mat-mini-fab color="warn"
                        (click)="clearThumbnail()" matTooltip="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          } @else {
            <!-- Zone de drop/clic -->
            <div class="upload-zone" style="max-width: 320px;"
                 (click)="!thumbUploading() && thumbInput.click()">
              @if (thumbUploading()) {
                <div class="py-4">
                  <mat-progress-bar mode="indeterminate" class="mb-3 rounded"></mat-progress-bar>
                  <p class="text-sm text-slate-500">Upload en cours…</p>
                </div>
              } @else {
                <mat-icon class="!text-4xl text-slate-300 mb-2">add_photo_alternate</mat-icon>
                <p class="text-sm font-medium text-slate-500">Cliquez pour ajouter une image</p>
                <p class="text-xs text-slate-400 mt-1">JPEG, PNG, WebP, GIF</p>
              }
            </div>
          }
        </div>

        <!-- ── Titre ── -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Titre du cours *</mat-label>
          <input matInput formControlName="titre" required
                 placeholder="Ex : Développement Web avec HTML & CSS" />
        </mat-form-field>

        <!-- ── Description ── -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description (min. 50 caractères)</mat-label>
          <textarea matInput formControlName="description" rows="4"
                    placeholder="Décrivez brièvement le contenu et les objectifs du cours…"></textarea>
          <mat-hint align="end">
            {{ form.get('description')?.value?.length ?? 0 }} car. / 50 min
          </mat-hint>
        </mat-form-field>

        <!-- ── Objectifs ── -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Objectifs pédagogiques (min. 30 caractères)</mat-label>
          <textarea matInput formControlName="objectifs" rows="3"
                    placeholder="À l'issue de ce cours, l'apprenant sera capable de…"></textarea>
          <mat-hint align="end">
            {{ form.get('objectifs')?.value?.length ?? 0 }} car. / 30 min
          </mat-hint>
        </mat-form-field>

        <!-- ── Prérequis ── -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Prérequis</mat-label>
          <textarea matInput formControlName="prerequis" rows="2"
                    placeholder="Notions requises avant ce cours…"></textarea>
        </mat-form-field>

        <!-- ── Niveau / Durée / Langue ── -->
        <div class="grid sm:grid-cols-3 gap-3">
          <mat-form-field appearance="outline">
            <mat-label>Niveau</mat-label>
            <mat-select formControlName="niveau">
              <mat-option value="debutant">Débutant</mat-option>
              <mat-option value="intermediaire">Intermédiaire</mat-option>
              <mat-option value="avance">Avancé</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Durée (min)</mat-label>
            <input matInput type="number" formControlName="duree" min="0" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Langue</mat-label>
            <mat-select formControlName="langue">
              <mat-option value="fr">Français</mat-option>
              <mat-option value="en">Anglais</mat-option>
              <mat-option value="wo">Wolof</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- ── Parcours (création uniquement) ── -->
        @if (!id() && paths().length > 0) {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Ajouter à un parcours (optionnel)</mat-label>
            <mat-icon matPrefix>route</mat-icon>
            <mat-select formControlName="path_id">
              <mat-option [value]="null">— Aucun —</mat-option>
              @for (p of paths(); track p.id) {
                <mat-option [value]="p.id">{{ p.titre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        <!-- ── Boutons d'action ── -->
        <div class="flex gap-2 justify-end pt-3 border-t border-slate-100 flex-wrap">
          <a mat-stroked-button routerLink="/instructor/paths">Annuler</a>

          <!-- Enregistrer (brouillon) -->
          <button mat-stroked-button type="submit"
                  [disabled]="form.invalid || saving() || thumbUploading()">
            <mat-icon>save</mat-icon>
            {{ saving() === 'save' ? 'Enregistrement…' : 'Enregistrer' }}
          </button>

          <!-- Enregistrer & Publier — visible seulement en mode édition si pas encore publié -->
          @if (id() && courseStatus() !== 'published') {
            <button mat-flat-button type="button" color="primary"
                    [disabled]="form.invalid || !!saving() || thumbUploading()"
                    (click)="saveAndPublish()">
              <mat-icon>rocket_launch</mat-icon>
              {{ saving() === 'publish' ? 'Envoi…' : 'Enregistrer & publier' }}
            </button>
          }
        </div>
      </form>

      <!-- Raccourcis rapides (édition uniquement) -->
      @if (id()) {
        <div class="grid sm:grid-cols-2 gap-3">
          <a [routerLink]="['/instructor/courses', id(), 'sections']"
             class="flex items-center gap-3 bg-white rounded-xl border border-slate-100
                    shadow-sm p-4 hover:border-edaara-primary/40 transition-colors cursor-pointer">
            <div class="w-10 h-10 rounded-xl bg-edaara-primary/10 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-edaara-primary">list</mat-icon>
            </div>
            <div>
              <p class="text-sm font-semibold text-edaara-dark">Sections & leçons</p>
              <p class="text-xs text-slate-400">Gérer le contenu du cours</p>
            </div>
          </a>
          <a routerLink="/instructor/paths"
             class="flex items-center gap-3 bg-white rounded-xl border border-slate-100
                    shadow-sm p-4 hover:border-edaara-primary/40 transition-colors cursor-pointer">
            <div class="w-10 h-10 rounded-xl bg-edaara-primary/10 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-edaara-primary">route</mat-icon>
            </div>
            <div>
              <p class="text-sm font-semibold text-edaara-dark">Mes parcours</p>
              <p class="text-xs text-slate-400">Organiser les cours en parcours</p>
            </div>
          </a>
        </div>
      }
    </div>

    <!-- ══ MODALE RÉSULTAT VALIDATION ══ -->
    @if (submitResult()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4
                    max-h-[90vh] overflow-y-auto">

          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                 [class.bg-green-100]="submitResult()!.decision === 'approved'"
                 [class.bg-amber-100]="submitResult()!.decision === 'rejected'">
              <mat-icon class="!text-2xl"
                        [class.text-green-600]="submitResult()!.decision === 'approved'"
                        [class.text-amber-500]="submitResult()!.decision === 'rejected'">
                {{ submitResult()!.decision === 'approved' ? 'check_circle' : 'pending_actions' }}
              </mat-icon>
            </div>
            <div class="flex-1 pt-0.5">
              <h3 class="font-bold text-edaara-dark">
                {{ submitResult()!.decision === 'approved'
                   ? 'Cours publié avec succès !'
                   : 'Critères de publication non atteints' }}
              </h3>
              <p class="text-sm text-slate-500 mt-1">{{ submitResult()!.message }}</p>
            </div>
          </div>

          <!-- Checklist critères -->
          <div class="space-y-1">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Critères de validation
            </p>
            @for (c of submitResult()!.criteria; track c.code) {
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg"
                   [class.bg-green-50]="c.passed"
                   [class.bg-red-50]="!c.passed">
                <mat-icon class="!text-base flex-shrink-0"
                          [class.text-green-600]="c.passed"
                          [class.text-red-500]="!c.passed">
                  {{ c.passed ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <span class="text-sm"
                      [class.text-green-700]="c.passed"
                      [class.text-red-700]="!c.passed">
                  {{ c.label }}
                </span>
              </div>
            }
          </div>

          @if (submitResult()!.decision === 'rejected') {
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              Complétez les éléments marqués en rouge, enregistrez puis cliquez à nouveau sur
              <strong>Enregistrer & publier</strong>.
            </div>
          }

          <div class="flex justify-end pt-2 border-t border-slate-100">
            <button mat-flat-button color="primary" (click)="submitResult.set(null)">
              Compris
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class InstructorCourseEditComponent implements OnInit {
  @ViewChild('thumbInput') private thumbInputRef!: ElementRef<HTMLInputElement>;

  private readonly fb            = inject(FormBuilder);
  private readonly route         = inject(ActivatedRoute);
  private readonly router        = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly pathService   = inject(PathService);
  private readonly mediaService  = inject(MediaService);
  private readonly snack         = inject(MatSnackBar);
  private readonly cdr           = inject(ChangeDetectorRef);

  protected readonly id              = signal<number | null>(null);
  // 'save' | 'publish' | false
  protected readonly saving          = signal<'save' | 'publish' | false>(false);
  protected readonly thumbUploading  = signal(false);
  protected readonly paths           = signal<Path[]>([]);
  protected readonly courseStatus    = signal<Course['status'] | null>(null);
  protected readonly submitResult    = signal<CriteriaResult | null>(null);
  protected readonly thumbnailPreview = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    titre:       ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    objectifs:   [''],
    prerequis:   [''],
    niveau:      ['debutant'],
    duree:       [60],
    langue:      ['fr'],
    thumbnail:   ['' as string | null],
    path_id:     [null as number | null]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      const numId = Number(idParam);
      this.id.set(numId);
      this.courseService.get(numId).subscribe({
        next: (res) => {
          if (res.data?.course) {
            const c = res.data.course;
            this.courseStatus.set(c.status ?? null);
            this.form.patchValue({
              titre:       c.titre       ?? '',
              description: c.description ?? '',
              objectifs:   c.objectifs   ?? '',
              prerequis:   c.prerequis   ?? '',
              niveau:      c.niveau      ?? 'debutant',
              duree:       c.duree       ?? 60,
              langue:      c.langue      ?? 'fr',
              thumbnail:   c.thumbnail   ?? null
            });
          }
        }
      });
    } else {
      this.pathService.list().subscribe({
        next: (res) => this.paths.set(res.data?.paths ?? [])
      });
    }
  }

  // ── Thumbnail ─────────────────────────────────────────────────────────────
  onThumbSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const ok = ['image/jpeg','image/png','image/webp','image/gif'];
    if (!ok.includes(file.type)) {
      this.snack.open(`Format non accepté : ${file.type || 'inconnu'}. Utilisez JPEG, PNG, WebP ou GIF.`, 'OK', { duration: 4000 });
      return;
    }
    this.thumbUploading.set(true);
    const reader = new FileReader();
    reader.onload = (e) => { this.thumbnailPreview.set(e.target?.result as string); this.cdr.markForCheck(); };
    reader.readAsDataURL(file);

    this.mediaService.upload(file, 'cours').subscribe({
      next: (res) => {
        this.thumbUploading.set(false);
        const url = res.data?.url ?? null;
        this.form.patchValue({ thumbnail: url });
        if (this.id() && url) {
          this.courseService.update(this.id()!, { thumbnail: url }).subscribe();
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.thumbUploading.set(false);
        this.thumbnailPreview.set(null);
        this.snack.open(err?.error?.message ?? "Erreur upload image", 'OK', { duration: 3000 });
        this.cdr.markForCheck();
      }
    });
  }

  clearThumbnail(): void {
    this.form.patchValue({ thumbnail: null });
    this.thumbnailPreview.set(null);
  }

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  save(): void           { this.doSave(false); }
  saveAndPublish(): void { this.doSave(true);  }

  private doSave(andPublish: boolean): void {
    if (this.form.invalid) return;
    this.saving.set(andPublish ? 'publish' : 'save');

    const { path_id, ...rest } = this.form.getRawValue();
    const payload: Partial<Course> = { ...rest, niveau: rest.niveau as Course['niveau'] };
    const isEdit = !!this.id();
    const obs = isEdit
      ? this.courseService.update(this.id()!, payload)
      : this.courseService.create(payload);

    obs.subscribe({
      next: (res) => {
        this.saving.set(false);
        const newCourseId = (res as any)?.data?.courseId;

        if (!isEdit && path_id && newCourseId) {
          this.pathService.addCourse(path_id, newCourseId).subscribe();
        }

        if (!isEdit) {
          this.snack.open('Cours créé — ajoutez maintenant sections et leçons', 'OK', { duration: 3000 });
          this.router.navigate(['/instructor/courses', newCourseId, 'sections']);
          return;
        }

        if (andPublish) {
          this.courseService.submit(this.id()!).subscribe({
            next: (sub) => {
              this.courseStatus.set(sub.decision === 'approved' ? 'published' : 'draft');
              this.submitResult.set({
                decision: sub.decision ?? 'rejected',
                message:  sub.message  ?? '',
                criteria: (sub as any).criteria ?? []
              });
            },
            error: (err) => {
              this.snack.open(err?.error?.message ?? 'Erreur lors de la soumission', 'OK', { duration: 3000 });
            }
          });
        } else {
          this.snack.open('Cours enregistré', 'OK', { duration: 2000 });
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message ?? "Erreur lors de l'enregistrement", 'OK', { duration: 3000 });
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  statusLabel(s: Course['status'] | null | undefined): string {
    switch (s) {
      case 'draft':     return 'Brouillon';
      case 'published': return 'Publié';
      case 'pending':   return 'En attente';
      case 'archived':  return 'Archivé';
      default:          return '';
    }
  }
}
