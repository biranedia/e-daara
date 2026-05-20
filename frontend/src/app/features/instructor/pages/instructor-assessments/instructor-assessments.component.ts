import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssessmentService } from '@core/services/assessment.service';
import { Assessment } from '@core/models';

@Component({
  selector: 'app-instructor-assessments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Évaluations & quiz</h1>
        <p class="text-slate-500">Créez et gérez vos quiz</p>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h3 class="font-semibold mb-2">Nouveau quiz</h3>
        <div class="flex flex-col sm:flex-row gap-2">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
            <input matInput [(ngModel)]="newTitle" placeholder="Titre du quiz" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="create()">
            <mat-icon>add</mat-icon> Créer
          </button>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-3">
        @for (a of assessments(); track a.id) {
          <a [routerLink]="['/instructor/assessments', a.id]"
             class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-edaara-dark">{{ a.titre }}</h3>
                <p class="text-xs text-slate-500 mt-1">
                  Score max {{ a.score_max || 100 }} · Tentatives {{ a.tentatives_max || '∞' }}
                </p>
              </div>
              <mat-icon class="text-edaara-primary">quiz</mat-icon>
            </div>
          </a>
        } @empty {
          <p class="col-span-full text-center py-12 text-slate-500">Aucun quiz</p>
        }
      </div>
    </div>
  `
})
export class InstructorAssessmentsComponent implements OnInit {
  private readonly assessmentService = inject(AssessmentService);
  private readonly snack = inject(MatSnackBar);

  protected readonly assessments = signal<Assessment[]>([]);
  protected newTitle = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.assessmentService.list().subscribe({
      next: (res) => this.assessments.set(res.data?.assessments ?? [])
    });
  }

  create(): void {
    if (!this.newTitle.trim()) return;
    this.assessmentService.create({ titre: this.newTitle, score_max: 100 }).subscribe({
      next: () => {
        this.newTitle = '';
        this.snack.open('Quiz créé', 'OK', { duration: 1500 });
        this.load();
      }
    });
  }
}
