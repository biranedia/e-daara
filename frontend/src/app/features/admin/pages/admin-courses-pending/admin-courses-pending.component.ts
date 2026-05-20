import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
    MatDialogModule, MatFormFieldModule, MatInputModule
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
          <p class="text-slate-600 mt-3">Aucun cours en attente. Bravo aux formateurs !</p>
        </div>
      } @else {
        <div class="grid gap-4">
          @for (c of courses(); track c.id) {
            <article class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div class="flex flex-col md:flex-row md:items-start gap-4">
                <div class="flex-1">
                  <h3 class="font-bold text-lg text-edaara-dark">{{ c.titre }}</h3>
                  <p class="text-sm text-slate-600 mt-1">{{ c.description }}</p>
                  <div class="flex flex-wrap gap-2 mt-3 text-xs">
                    @if (c.niveau) {
                      <span class="px-2 py-1 rounded bg-slate-100">Niveau : {{ c.niveau }}</span>
                    }
                    @if (c.duree) {
                      <span class="px-2 py-1 rounded bg-slate-100">{{ c.duree }} min</span>
                    }
                    <span class="px-2 py-1 rounded bg-amber-100 text-amber-700">
                      Formateur : {{ c.instructor_prenom }} {{ c.instructor_nom }}
                    </span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button mat-flat-button color="primary" (click)="approve(c)">
                    <mat-icon>check</mat-icon>
                    Approuver
                  </button>
                  <button mat-stroked-button color="warn" (click)="reject(c)">
                    <mat-icon>close</mat-icon>
                    Refuser
                  </button>
                </div>
              </div>
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
  private readonly dialog = inject(MatDialog);

  protected readonly courses = signal<Course[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.admin.pendingCourses().subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
  }

  approve(c: Course): void {
    this.admin.validateCourse(c.id, 'approve').subscribe({
      next: () => {
        this.snack.open(`Cours "${c.titre}" approuvé`, 'OK', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Erreur', 'OK', { duration: 3000 })
    });
  }

  reject(c: Course): void {
    const motif = prompt(`Motif du refus pour "${c.titre}" ?`);
    if (!motif) return;
    this.admin.validateCourse(c.id, 'reject', motif).subscribe({
      next: () => {
        this.snack.open('Cours refusé, formateur notifié', 'OK', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Erreur', 'OK', { duration: 3000 })
    });
  }
}
