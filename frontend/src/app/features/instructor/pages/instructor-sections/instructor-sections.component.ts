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
import { Lesson, Resource, Section } from '@core/models';

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

      <!-- Formulaire nouvelle section -->
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

      <mat-accordion multi>
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

            <div class="space-y-3 pt-2">
              <!-- Liste des leçons -->
              @for (l of lessonsBySection()[s.id] || []; track l.id) {
                <div class="border border-slate-200 rounded-lg">
                  <!-- En-tête leçon -->
                  <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-t-lg">
                    <mat-icon class="text-slate-400 !text-base">{{ iconFor(l.type) }}</mat-icon>
                    <span class="flex-1 text-sm font-medium">{{ l.ordre }}. {{ l.titre }}</span>
                    <span class="text-xs text-slate-500">{{ l.duree }} min</span>
                    <button mat-icon-button (click)="toggleResources(l.id)" aria-label="Ressources">
                      <mat-icon class="!text-base !text-slate-400">attach_file</mat-icon>
                    </button>
                    <button mat-icon-button (click)="removeLesson(l, s.id)" aria-label="Supprimer">
                      <mat-icon class="!text-base !text-red-400">delete</mat-icon>
                    </button>
                  </div>

                  <!-- Panneau ressources (dépliable) -->
                  @if (expandedLesson() === l.id) {
                    <div class="p-3 bg-white space-y-2">
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ressources</p>
                      @for (r of resourcesByLesson()[l.id] || []; track r.id) {
                        <div class="flex items-center gap-2 text-sm py-1">
                          <mat-icon class="!text-base text-slate-400">{{ resIcon(r.type) }}</mat-icon>
                          <a [href]="r.url" target="_blank" class="flex-1 truncate text-blue-600 hover:underline">
                            {{ r.titre }}
                          </a>
                          <button mat-icon-button (click)="removeResource(r, l.id)" aria-label="Supprimer">
                            <mat-icon class="!text-base !text-red-400">close</mat-icon>
                          </button>
                        </div>
                      } @empty {
                        <p class="text-xs text-slate-400">Aucune ressource</p>
                      }

                      <!-- Formulaire ajout ressource -->
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                        <mat-form-field appearance="outline" subscriptSizing="dynamic">
                          <mat-label>Titre</mat-label>
                          <input matInput [ngModel]="getNewRes(l.id).titre" (ngModelChange)="getNewRes(l.id).titre = $event" />
                        </mat-form-field>
                        <mat-form-field appearance="outline" subscriptSizing="dynamic">
                          <mat-label>URL</mat-label>
                          <input matInput [ngModel]="getNewRes(l.id).url" (ngModelChange)="getNewRes(l.id).url = $event" />
                        </mat-form-field>
                        <mat-form-field appearance="outline" subscriptSizing="dynamic">
                          <mat-label>Type</mat-label>
                          <mat-select [ngModel]="getNewRes(l.id).type" (ngModelChange)="getNewRes(l.id).type = $event">
                            <mat-option value="video">Vidéo</mat-option>
                            <mat-option value="pdf">PDF</mat-option>
                            <mat-option value="lien">Lien</mat-option>
                            <mat-option value="image">Image</mat-option>
                            <mat-option value="audio">Audio</mat-option>
                            <mat-option value="autre">Autre</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                      <div class="flex justify-end">
                        <button mat-flat-button color="accent" (click)="addResource(l.id)">
                          <mat-icon>add</mat-icon> Ajouter ressource
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Formulaire ajout leçon -->
              <div class="grid sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-2">
                  <input matInput
                    [ngModel]="getNewLesson(s.id).titre"
                    (ngModelChange)="getNewLesson(s.id).titre = $event"
                    placeholder="Titre de la leçon" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-select [ngModel]="getNewLesson(s.id).type" (ngModelChange)="getNewLesson(s.id).type = $event">
                    <mat-option value="video">Vidéo</mat-option>
                    <mat-option value="pdf">PDF</mat-option>
                    <mat-option value="texte">Texte</mat-option>
                    <mat-option value="lien">Lien</mat-option>
                    <mat-option value="projet">Projet</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-flat-button color="primary" (click)="addLesson(s.id)">
                  <mat-icon>add</mat-icon> Ajouter
                </button>
              </div>

              <div class="flex justify-end">
                <button mat-stroked-button color="warn" (click)="removeSection(s)">
                  <mat-icon>delete</mat-icon> Supprimer la section
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
  protected readonly resourcesByLesson = signal<Record<number, Resource[]>>({});
  protected readonly expandedLesson = signal<number | null>(null);

  protected newSectionTitle = '';
  protected newLesson: Record<number, { titre: string; type: string; duree: number }> = {};
  protected newResource: Record<number, { titre: string; url: string; type: string }> = {};

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

  loadResources(lessonId: number): void {
    this.courseService.listResources(lessonId).subscribe({
      next: (res) => {
        this.resourcesByLesson.update((m) => ({ ...m, [lessonId]: res.data?.resources ?? [] }));
      }
    });
  }

  toggleResources(lessonId: number): void {
    if (this.expandedLesson() === lessonId) {
      this.expandedLesson.set(null);
    } else {
      this.expandedLesson.set(lessonId);
      this.loadResources(lessonId);
    }
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
        this.newLesson[sectionId] = this.emptyLesson();
        this.loadLessons(sectionId);
      }
    });
  }

  removeLesson(l: Lesson, sectionId: number): void {
    if (!confirm(`Supprimer la leçon "${l.titre}" ?`)) return;
    this.courseService.deleteLesson(l.id).subscribe({
      next: () => {
        if (this.expandedLesson() === l.id) this.expandedLesson.set(null);
        this.loadLessons(sectionId);
      }
    });
  }

  addResource(lessonId: number): void {
    const data = this.newResource[lessonId];
    if (!data?.titre.trim() || !data?.url.trim()) return;
    this.courseService.createResource({
      lesson_id: lessonId,
      titre: data.titre,
      url: data.url,
      type: data.type as Resource['type'],
      ordre: (this.resourcesByLesson()[lessonId] || []).length + 1
    }).subscribe({
      next: () => {
        this.newResource[lessonId] = this.emptyRes();
        this.snack.open('Ressource ajoutée', 'OK', { duration: 1500 });
        this.loadResources(lessonId);
      },
      error: () => this.snack.open('Erreur lors de l\'ajout', 'OK', { duration: 3000 })
    });
  }

  removeResource(r: Resource, lessonId: number): void {
    this.courseService.deleteResource(r.id).subscribe({
      next: () => {
        this.snack.open('Ressource supprimée', 'OK', { duration: 1500 });
        this.loadResources(lessonId);
      }
    });
  }

  iconFor(t?: string): string {
    return { video: 'play_circle', pdf: 'picture_as_pdf', texte: 'article', lien: 'link', projet: 'assignment' }[t ?? ''] ?? 'article';
  }

  resIcon(t?: string): string {
    return { video: 'videocam', pdf: 'picture_as_pdf', lien: 'link', image: 'image', audio: 'headphones', autre: 'attach_file' }[t ?? ''] ?? 'attach_file';
  }

  emptyLesson() { return { titre: '', type: 'video', duree: 10 }; }
  emptyRes() { return { titre: '', url: '', type: 'lien' }; }

  getNewLesson(sectionId: number): { titre: string; type: string; duree: number } {
    if (!this.newLesson[sectionId]) {
      this.newLesson[sectionId] = this.emptyLesson();
    }
    return this.newLesson[sectionId];
  }

  getNewRes(lessonId: number): { titre: string; url: string; type: string } {
    if (!this.newResource[lessonId]) {
      this.newResource[lessonId] = this.emptyRes();
    }
    return this.newResource[lessonId];
  }
}
