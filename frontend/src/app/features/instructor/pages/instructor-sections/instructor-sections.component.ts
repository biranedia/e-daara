import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '@core/services/course.service';
import { Lesson, Section } from '@core/models';

@Component({
  selector: 'app-instructor-sections',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatExpansionModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  template: `
    <div class="space-y-4">
      <header class="flex items-center gap-3">
        <a mat-icon-button routerLink="/instructor/courses" aria-label="Retour">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Sections & leçons</h1>
          <p class="text-slate-500 text-sm">Organisez votre cours en sections et leçons</p>
        </div>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h3 class="font-semibold mb-2">Ajouter une section</h3>
        <div class="flex gap-2">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
            <input matInput [(ngModel)]="newSectionTitle" placeholder="Titre de la section" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="addSection()">
            <mat-icon>add</mat-icon> Ajouter
          </button>
        </div>
      </div>

      <mat-accordion>
        @for (s of sections(); track s.id) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title class="font-semibold">
                {{ s.ordre }}. {{ s.titre }}
              </mat-panel-title>
              <mat-panel-description>
                {{ (lessonsBySection()[s.id] || []).length }} leçon(s)
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="space-y-2 pt-2">
              @for (l of lessonsBySection()[s.id] || []; track l.id) {
                <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded">
                  <mat-icon class="text-slate-400">{{ iconFor(l.type) }}</mat-icon>
                  <span class="flex-1 text-sm">{{ l.ordre }}. {{ l.titre }}</span>
                  <span class="text-xs text-slate-500">{{ l.duree }} min</span>
                  <button mat-icon-button (click)="removeLesson(l, s.id)" aria-label="Supprimer">
                    <mat-icon class="!text-red-500">delete</mat-icon>
                  </button>
                </div>
              }

              <div class="grid sm:grid-cols-4 gap-2 mt-3 p-3 bg-slate-50 rounded">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-2">
                  <input matInput [(ngModel)]="newLesson[s.id] ||= { titre: '', type: 'video', duree: 10 }; newLesson[s.id]!.titre"
                         placeholder="Titre de la leçon" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-select [(ngModel)]="newLesson[s.id]!.type">
                    <mat-option value="video">Vidéo</mat-option>
                    <mat-option value="pdf">PDF</mat-option>
                    <mat-option value="texte">Texte</mat-option>
                    <mat-option value="lien">Lien</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-flat-button color="primary" (click)="addLesson(s.id)">
                  <mat-icon>add</mat-icon> Ajouter
                </button>
              </div>

              <div class="flex justify-end mt-3">
                <button mat-stroked-button color="warn" (click)="removeSection(s)">
                  <mat-icon>delete</mat-icon> Supprimer cette section
                </button>
              </div>
            </div>
          </mat-expansion-panel>
        } @empty {
          <p class="text-center py-12 text-slate-500">
            Pas encore de section. Créez-en une au-dessus.
          </p>
        }
      </mat-accordion>
    </div>
  `
})
export class InstructorSectionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly snack = inject(MatSnackBar);

  protected readonly courseId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly sections = signal<Section[]>([]);
  protected readonly lessonsBySection = signal<Record<number, Lesson[]>>({});
  protected newSectionTitle = '';
  protected newLesson: Record<number, { titre: string; type: string; duree: number }> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.courseService.listSections(this.courseId).subscribe({
      next: (res) => {
        const list = res.data?.sections ?? [];
        this.sections.set(list);
        list.forEach((s) => this.loadLessons(s.id));
      }
    });
  }

  loadLessons(sectionId: number): void {
    this.courseService.listLessons(sectionId).subscribe({
      next: (res) => {
        this.lessonsBySection.update((m) => ({ ...m, [sectionId]: res.data?.lessons ?? [] }));
      }
    });
  }

  addSection(): void {
    if (!this.newSectionTitle.trim()) return;
    this.courseService.createSection({
      course_id: this.courseId,
      titre: this.newSectionTitle,
      ordre: this.sections().length + 1
    }).subscribe({
      next: () => {
        this.newSectionTitle = '';
        this.snack.open('Section ajoutée', 'OK', { duration: 1500 });
        this.load();
      }
    });
  }

  removeSection(s: Section): void {
    if (!confirm(`Supprimer la section "${s.titre}" ?`)) return;
    this.courseService.deleteSection(s.id).subscribe({
      next: () => this.load()
    });
  }

  addLesson(sectionId: number): void {
    const data = this.newLesson[sectionId];
    if (!data?.titre.trim()) return;
    const ordre = (this.lessonsBySection()[sectionId] || []).length + 1;
    this.courseService.createLesson({
      section_id: sectionId,
      titre: data.titre,
      type: data.type as Lesson['type'],
      duree: data.duree,
      ordre
    }).subscribe({
      next: () => {
        this.newLesson[sectionId] = { titre: '', type: 'video', duree: 10 };
        this.loadLessons(sectionId);
      }
    });
  }

  removeLesson(l: Lesson, sectionId: number): void {
    this.courseService.deleteLesson(l.id).subscribe({
      next: () => this.loadLessons(sectionId)
    });
  }

  iconFor(t?: string): string {
    return { video: 'play_circle', pdf: 'picture_as_pdf', texte: 'article', lien: 'link', projet: 'assignment' }[t ?? ''] ?? 'article';
  }
}
