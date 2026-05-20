import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssessmentService } from '@core/services/assessment.service';
import { Answer, Assessment, Question, QuizResult } from '@core/models';

/**
 * Quiz interactif — démonstration vivante en soutenance.
 * QCM, vrai/faux, texte libre. Score automatique côté backend.
 */
@Component({
  selector: 'app-student-quiz',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatRadioModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="max-w-3xl mx-auto space-y-4">
      <header class="flex items-center gap-3">
        <a mat-icon-button routerLink="/student/courses" aria-label="Retour">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-edaara-dark">{{ assessment()?.titre || 'Quiz' }}</h1>
          <p class="text-sm text-slate-500">
            {{ questions().length }} questions ·
            Score max {{ assessment()?.score_max || 100 }}
          </p>
        </div>
      </header>

      @if (result()) {
        <!-- Écran de résultat -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <mat-icon class="!w-20 !h-20 !text-7xl"
                    [class.text-green-500]="result()!.est_reussi"
                    [class.text-red-500]="!result()!.est_reussi">
            {{ result()!.est_reussi ? 'celebration' : 'sentiment_dissatisfied' }}
          </mat-icon>
          <h2 class="text-3xl font-bold mt-4">
            {{ result()!.score }} / {{ result()!.total }}
          </h2>
          <p class="text-slate-600 mt-2">
            {{ result()!.est_reussi ? 'Bravo, quiz réussi !' : 'Pas tout à fait... Réessayez !' }}
          </p>
          <div class="flex gap-2 justify-center mt-6">
            <a mat-stroked-button routerLink="/student/courses">Retour aux cours</a>
            <button mat-flat-button color="primary" (click)="restart()">Refaire le quiz</button>
          </div>
        </div>
      } @else if (questions().length > 0) {
        <!-- Question courante -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div class="flex items-center justify-between text-sm text-slate-500">
            <span>Question {{ index() + 1 }} / {{ questions().length }}</span>
            <span>{{ current().points }} pts</span>
          </div>

          <h2 class="text-xl font-semibold text-edaara-dark">{{ current().enonce }}</h2>

          @if (current().type === 'qcm' || current().type === 'vrai_faux') {
            <mat-radio-group [(ngModel)]="selectedAnswerId[current().id]" class="flex flex-col gap-2">
              @for (a of answersOf(current().id); track a.id) {
                <mat-radio-button [value]="a.id" class="!p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  {{ a.texte }}
                </mat-radio-button>
              }
            </mat-radio-group>
          } @else if (current().type === 'texte') {
            <textarea [(ngModel)]="freeText[current().id]"
                      rows="4"
                      class="w-full border border-slate-300 rounded-lg p-3"
                      placeholder="Votre réponse..."></textarea>
          }

          <div class="flex justify-between pt-4 border-t border-slate-100">
            <button mat-stroked-button (click)="prev()" [disabled]="index() === 0">
              <mat-icon>chevron_left</mat-icon> Précédent
            </button>
            @if (index() < questions().length - 1) {
              <button mat-flat-button color="primary" (click)="next()">
                Suivant <mat-icon>chevron_right</mat-icon>
              </button>
            } @else {
              <button mat-flat-button color="accent" (click)="submit()" [disabled]="submitting()">
                @if (submitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <ng-container>
                    <mat-icon>send</mat-icon> Soumettre
                  </ng-container>
                }
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-slate-500">
          <mat-spinner diameter="40" class="mx-auto"></mat-spinner>
          <p class="mt-3">Chargement du quiz...</p>
        </div>
      }
    </div>
  `
})
export class StudentQuizComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly assessmentService = inject(AssessmentService);

  protected readonly assessmentId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly assessment = signal<Assessment | null>(null);
  protected readonly questions = signal<Question[]>([]);
  protected readonly answersByQuestion = signal<Record<number, Answer[]>>({});
  protected readonly index = signal(0);
  protected readonly result = signal<QuizResult | null>(null);
  protected readonly submitting = signal(false);

  protected selectedAnswerId: Record<number, number> = {};
  protected freeText: Record<number, string> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.assessmentService.get(this.assessmentId).subscribe({
      next: (res) => this.assessment.set(res.data?.assessment ?? null)
    });
    this.assessmentService.listQuestions(this.assessmentId).subscribe({
      next: (res) => {
        const qs = res.data?.questions ?? [];
        this.questions.set(qs);
        // Charger réponses pour chaque question (en pratique le backend devrait les fournir avec)
        qs.forEach((q) => {
          this.answersByQuestion.update((m) => ({ ...m, [q.id]: [] }));
        });
      }
    });
  }

  current(): Question {
    return this.questions()[this.index()];
  }

  answersOf(qId: number): Answer[] {
    return this.answersByQuestion()[qId] || [];
  }

  prev(): void {
    if (this.index() > 0) this.index.update((i) => i - 1);
  }

  next(): void {
    if (this.index() < this.questions().length - 1) this.index.update((i) => i + 1);
  }

  submit(): void {
    this.submitting.set(true);
    const answers = this.questions().map((q) => ({
      question_id: q.id,
      answer_id: this.selectedAnswerId[q.id],
      texte: this.freeText[q.id]
    }));
    this.assessmentService.submit({ assessment_id: this.assessmentId, answers }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.data?.result) this.result.set(res.data.result);
      },
      error: () => {
        this.submitting.set(false);
      }
    });
  }

  restart(): void {
    this.selectedAnswerId = {};
    this.freeText = {};
    this.index.set(0);
    this.result.set(null);
  }
}
