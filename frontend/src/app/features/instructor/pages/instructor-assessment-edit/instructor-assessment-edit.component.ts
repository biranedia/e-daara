import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssessmentService } from '@core/services/assessment.service';
import { Question } from '@core/models';

@Component({
  selector: 'app-instructor-assessment-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCheckboxModule
  ],
  template: `
    <div class="space-y-4">
      <header class="flex items-center gap-3">
        <a mat-icon-button routerLink="/instructor/assessments" aria-label="Retour">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-bold text-edaara-dark">Éditer le quiz</h1>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-3">
        <h3 class="font-semibold">Ajouter une question</h3>
        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
          <mat-label>Énoncé</mat-label>
          <textarea matInput [(ngModel)]="newQ.enonce" rows="2"></textarea>
        </mat-form-field>
        <div class="grid sm:grid-cols-2 gap-2">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="newQ.type">
              <mat-option value="qcm">QCM</mat-option>
              <mat-option value="vrai_faux">Vrai/Faux</mat-option>
              <mat-option value="texte">Texte libre</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Points</mat-label>
            <input matInput type="number" [(ngModel)]="newQ.points" min="1" />
          </mat-form-field>
        </div>
        <button mat-flat-button color="primary" (click)="addQuestion()">
          <mat-icon>add</mat-icon> Ajouter la question
        </button>
      </div>

      <section class="space-y-3">
        @for (q of questions(); track q.id; let i = $index) {
          <article class="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <p class="font-medium text-edaara-dark">Q{{ i + 1 }}. {{ q.enonce }}</p>
                <p class="text-xs text-slate-500 mt-1">{{ q.type }} · {{ q.points }} pts</p>
              </div>
              <button mat-icon-button (click)="removeQuestion(q)" aria-label="Supprimer">
                <mat-icon class="!text-red-500">delete</mat-icon>
              </button>
            </div>

            @if (q.type === 'qcm' || q.type === 'vrai_faux') {
              <div class="mt-3 space-y-2">
                <p class="text-xs font-semibold text-slate-600 uppercase">Réponses</p>
                <div class="flex gap-2 items-center">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
                    <input matInput
                      [ngModel]="getNewAnswer(q.id).texte"
                      (ngModelChange)="getNewAnswer(q.id).texte = $event"
                      placeholder="Texte de la réponse" />
                  </mat-form-field>
                  <mat-checkbox
                    [ngModel]="getNewAnswer(q.id).est_correcte"
                    (ngModelChange)="getNewAnswer(q.id).est_correcte = $event">Correcte</mat-checkbox>
                  <button mat-stroked-button color="primary" (click)="addAnswer(q.id)">Ajouter</button>
                </div>
              </div>
            }
          </article>
        } @empty {
          <p class="text-center py-12 text-slate-500">Pas encore de question</p>
        }
      </section>
    </div>
  `
})
export class InstructorAssessmentEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly assessmentService = inject(AssessmentService);
  private readonly snack = inject(MatSnackBar);

  protected readonly assessmentId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly questions = signal<Question[]>([]);
  protected newQ: { enonce: string; type: string; points: number } = { enonce: '', type: 'qcm', points: 1 };
  protected newAnswer: Record<number, { texte: string; est_correcte: boolean }> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.assessmentService.listQuestions(this.assessmentId).subscribe({
      next: (res) => this.questions.set(res.data?.questions ?? [])
    });
  }

  addQuestion(): void {
    if (!this.newQ.enonce.trim()) return;
    this.assessmentService.createQuestion(this.assessmentId, this.newQ as Partial<Question>).subscribe({
      next: () => {
        this.newQ = { enonce: '', type: 'qcm', points: 1 };
        this.load();
      }
    });
  }

  removeQuestion(q: Question): void {
    this.assessmentService.deleteQuestion(q.id).subscribe({ next: () => this.load() });
  }

  getNewAnswer(questionId: number): { texte: string; est_correcte: boolean } {
    if (!this.newAnswer[questionId]) {
      this.newAnswer[questionId] = { texte: '', est_correcte: false };
    }
    return this.newAnswer[questionId];
  }

  addAnswer(questionId: number): void {
    const data = this.newAnswer[questionId];
    if (!data?.texte.trim()) return;
    this.assessmentService.addAnswer(questionId, data).subscribe({
      next: () => {
        this.newAnswer[questionId] = { texte: '', est_correcte: false };
        this.snack.open('Réponse ajoutée', 'OK', { duration: 1500 });
      }
    });
  }
}
