import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';
import { Course } from '@core/models';

@Component({
  selector: 'app-admin-courses-pending',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Validation des cours</h1>
        <p class="text-slate-500">{{ courses().length }} cours en attente de modération</p>
      </header>

      @if (courses().length === 0) {
        <div class="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <mat-icon class="!w-16 !h-16 !text-6xl text-green-500">verified</mat-icon>
          <p class="text-slate-600 mt-3 font-medium">Aucun cours en attente.</p>
          <p class="text-slate-400 text-sm">Tous les cours soumis ont été traités.</p>
        </div>
      } @else {
        <div class="grid gap-4">
          @for (c of courses(); track c.id) {
            <article class="bg-white rounded-xl shadow-sm border border-slate-100">
              <div class="p-5">
                <div class="flex flex-col md:flex-row md:items-start gap-4">
                  <div class="flex-1">
                    <h3 class="font-bold text-lg text-edaara-dark">{{ c.titre }}</h3>
                    <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ c.description }}</p>
                    <div class="flex flex-wrap gap-2 mt-3 text-xs">
                      @if (c.niveau) {
                        <span class="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{{ c.niveau }}</span>
                      }
                      @if (c.duree) {
                        <span class="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{{ c.duree }} min</span>
                      }
                      <span class="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                        {{ c.instructor_prenom }} {{ c.instructor_nom }}
                      </span>
                      <span class="px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                        Soumis le {{ c.created_at | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <button mat-flat-button color="primary" (click)="approve(c)" [disabled]="processing() === c.id">
                      <mat-icon>check_circle</mat-icon> Approuver
                    </button>
                    <button mat-stroked-button color="warn" (click)="toggleReject(c)" [disabled]="processing() === c.id">
                      <mat-icon>cancel</mat-icon> Refuser
                    </button>
                  </div>
                </div>
              </div>

              <!-- Inline reject form -->
              @if (rejectingId() === c.id) {
                <div class="border-t border-slate-100 px-5 py-4 bg-red-50/50 space-y-3">
                  <p class="text-sm font-medium text-red-700">Motif du refus</p>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                    <mat-label>Expliquer le refus au formateur</mat-label>
                    <textarea matInput rows="2" [(ngModel)]="rejectMotif" placeholder="Ex: Le contenu ne respecte pas les lignes directrices…"></textarea>
                  </mat-form-field>
                  <div class="flex gap-2 justify-end">
                    <button mat-button (click)="toggleReject(null)">Annuler</button>
                    <button mat-flat-button color="warn" (click)="confirmReject(c)" [disabled]="!rejectMotif.trim()">
                      Confirmer le refus
                    </button>
                  </div>
                </div>
              }
            </article>
          }
        </div>
      }
    </div>
  `
})
export class AdminCoursesPendingComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);

  protected readonly courses = signal<Course[]>([]);
  protected readonly processing = signal<number | null>(null);
  protected readonly rejectingId = signal<number | null>(null);
  protected rejectMotif = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.admin.pendingCourses().subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
  }

  approve(c: Course): void {
    this.processing.set(c.id);
    this.admin.validateCourse(c.id, 'approved').subscribe({
      next: () => {
        this.processing.set(null);
        this.snack.open(`"${c.titre}" approuvé et publié`, 'OK', { duration: 2500 });
        this.load();
      },
      error: () => { this.processing.set(null); this.snack.open('Erreur', 'OK', { duration: 3000 }); }
    });
  }

  toggleReject(c: Course | null): void {
    this.rejectingId.set(c?.id ?? null);
    this.rejectMotif = '';
  }

  confirmReject(c: Course): void {
    if (!this.rejectMotif.trim()) return;
    this.processing.set(c.id);
    this.admin.validateCourse(c.id, 'rejected', this.rejectMotif).subscribe({
      next: () => {
        this.processing.set(null);
        this.rejectingId.set(null);
        this.rejectMotif = '';
        this.snack.open(`"${c.titre}" refusé`, 'OK', { duration: 2500 });
        this.load();
      },
      error: () => { this.processing.set(null); this.snack.open('Erreur', 'OK', { duration: 3000 }); }
    });
  }
}
