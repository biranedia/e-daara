import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '@core/services/course.service';

@Component({
  selector: 'app-instructor-course-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule
  ],
  template: `
    <div class="space-y-4 max-w-3xl">
      <header class="flex items-center gap-3">
        <a mat-icon-button routerLink="/instructor/courses" aria-label="Retour">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">
            {{ id() ? 'Modifier le cours' : 'Nouveau cours' }}
          </h1>
          <p class="text-slate-500 text-sm">Remplissez les informations principales du cours</p>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="save()"
            class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Titre du cours</mat-label>
          <input matInput formControlName="titre" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Objectifs pédagogiques</mat-label>
          <textarea matInput formControlName="objectifs" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Prérequis</mat-label>
          <textarea matInput formControlName="prerequis" rows="2"></textarea>
        </mat-form-field>

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
            <mat-label>Durée (minutes)</mat-label>
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

        <div class="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <a mat-stroked-button routerLink="/instructor/courses">Annuler</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            <mat-icon>save</mat-icon>
            {{ id() ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class InstructorCourseEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly snack = inject(MatSnackBar);

  protected readonly id = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    titre: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    objectifs: [''],
    prerequis: [''],
    niveau: ['debutant'],
    duree: [60],
    langue: ['fr']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      const id = Number(idParam);
      this.id.set(id);
      this.courseService.get(id).subscribe({
        next: (res) => {
          if (res.data?.course) {
            this.form.patchValue(res.data.course);
          }
        }
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = this.form.getRawValue();
    const obs = this.id()
      ? this.courseService.update(this.id()!, payload)
      : this.courseService.create(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open('Cours enregistré', 'OK', { duration: 2000 });
        this.router.navigate(['/instructor/courses']);
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Erreur lors de l\'enregistrement', 'OK', { duration: 3000 });
      }
    });
  }
}
