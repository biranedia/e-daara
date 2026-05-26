import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService } from '@core/services/course.service';
import { EnrollmentService } from '@core/services/enrollment.service';
import { Course, Lesson, Section } from '@core/models';

/**
 * Lecteur de cours : vidéo / PDF / texte / lien.
 * Navigation par section et leçon, marquage progression.
 */
@Component({
  selector: 'app-student-course-player',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="space-y-4">
      <header class="flex items-center gap-3">
        <a mat-icon-button routerLink="/student/courses" aria-label="Retour à mes cours">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-edaara-dark">{{ course()?.titre }}</h1>
          <p class="text-sm text-slate-500">{{ course()?.description }}</p>
        </div>
      </header>

      <div class="grid lg:grid-cols-[1fr_320px] gap-4">
        <!-- Lecteur principal -->
        <main class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          @if (currentLesson(); as l) {
            <div class="aspect-video bg-black flex items-center justify-center">
              @if (l.type === 'video' && embedUrl()) {
                <iframe [src]="embedUrl()" frameborder="0" class="w-full h-full"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
              } @else if (l.type === 'pdf' && l.url) {
                <iframe [src]="embedUrl()" class="w-full h-full"></iframe>
              } @else if (l.type === 'texte') {
                <article class="prose max-w-none p-8 bg-white text-slate-800">
                  {{ l.contenu }}
                </article>
              } @else if (l.type === 'lien') {
                <a [href]="l.url" target="_blank" rel="noopener"
                   class="text-white p-8 hover:underline">
                  Ouvrir le lien externe ↗
                </a>
              } @else {
                <p class="text-white">Type de contenu non supporté</p>
              }
            </div>

            <div class="p-4">
              <h2 class="font-semibold text-edaara-dark text-lg">{{ l.titre }}</h2>
              <p class="text-sm text-slate-500 mt-1">{{ l.duree }} min · {{ l.type }}</p>
              <div class="flex gap-2 mt-4">
                <button mat-stroked-button (click)="prev()" [disabled]="!hasPrev()">
                  <mat-icon>chevron_left</mat-icon> Précédent
                </button>
                <button mat-flat-button color="primary" (click)="markCompleted()">
                  <mat-icon>check_circle</mat-icon> Marquer terminé
                </button>
                <button mat-stroked-button (click)="next()" [disabled]="!hasNext()">
                  Suivant <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          } @else {
            <div class="aspect-video flex items-center justify-center text-slate-500">
              Sélectionnez une leçon dans la liste à droite
            </div>
          }
        </main>

        <!-- Sommaire -->
        <aside class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <header class="p-4 border-b border-slate-100">
            <h3 class="font-semibold text-edaara-dark">Sommaire</h3>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ completedCount() }} / {{ allLessons().length }} terminée(s)
            </p>
            <mat-progress-bar mode="determinate" [value]="progressPercent()" class="mt-2"></mat-progress-bar>
          </header>
          <div class="overflow-y-auto" style="max-height: 60vh">
            @for (s of sections(); track s.id) {
              <div class="border-b border-slate-100 last:border-0">
                <div class="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {{ s.titre }}
                </div>
                @for (l of lessonsBySection()[s.id] || []; track l.id) {
                  <button (click)="selectLesson(l)"
                          class="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
                          [class.bg-edaara-primary]="currentLesson()?.id === l.id"
                          [class.text-white]="currentLesson()?.id === l.id">
                    <mat-icon class="!text-base">{{ iconFor(l.type) }}</mat-icon>
                    <span class="flex-1">{{ l.titre }}</span>
                    @if (isCompleted(l.id)) {
                      <mat-icon class="!text-base !text-green-500">check_circle</mat-icon>
                    }
                  </button>
                }
              </div>
            }
          </div>
        </aside>
      </div>
    </div>
  `
})
export class StudentCoursePlayerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly enrollment = inject(EnrollmentService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly courseId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly course = signal<Course | null>(null);
  protected readonly sections = signal<Section[]>([]);
  protected readonly lessonsBySection = signal<Record<number, Lesson[]>>({});
  protected readonly currentLesson = signal<Lesson | null>(null);
  protected readonly completed = signal<Set<number>>(new Set());

  protected readonly allLessons = computed(() => {
    const flat: Lesson[] = [];
    this.sections().forEach((s) => {
      (this.lessonsBySection()[s.id] || []).forEach((l) => flat.push(l));
    });
    return flat;
  });

  protected readonly completedCount = computed(() =>
    this.allLessons().filter((l) => this.completed().has(l.id)).length
  );

  protected readonly progressPercent = computed(() => {
    const total = this.allLessons().length;
    return total === 0 ? 0 : Math.round((this.completedCount() / total) * 100);
  });

  protected readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.currentLesson()?.url;
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  ngOnInit(): void {
    this.courseService.getPublicCourse(this.courseId).subscribe({
      next: (res) => {
        // Backend spread le cours dans data : { ...course, sections }
        if (res.data) this.course.set(res.data);
      }
    });
    this.loadStructure();
    this.loadProgress();
  }

  loadStructure(): void {
    this.courseService.listSections(this.courseId).subscribe({
      next: (res) => {
        const sections = res.data?.sections ?? [];
        this.sections.set(sections);
        sections.forEach((s) => {
          this.courseService.listLessons(s.id).subscribe({
            next: (r) => {
              this.lessonsBySection.update((m) => ({
                ...m,
                [s.id]: r.data?.lessons ?? []
              }));
              if (!this.currentLesson() && (r.data?.lessons?.length ?? 0) > 0) {
                this.currentLesson.set(r.data!.lessons![0]);
              }
            }
          });
        });
      }
    });
  }

  loadProgress(): void {
    this.enrollment.getLessonProgress().subscribe({
      next: (res) => {
        const set = new Set<number>();
        (res.data?.progress ?? [])
          .filter((p) => p.status === 'completed')
          .forEach((p) => set.add(p.lesson_id));
        this.completed.set(set);
      }
    });
  }

  selectLesson(l: Lesson): void {
    this.currentLesson.set(l);
  }

  markCompleted(): void {
    const l = this.currentLesson();
    if (!l) return;
    this.enrollment.setLessonProgress({ lesson_id: l.id, status: 'completed' }).subscribe({
      next: () => {
        this.completed.update((s) => new Set(s).add(l.id));
        this.next();
      }
    });
  }

  isCompleted(id: number): boolean {
    return this.completed().has(id);
  }

  hasPrev(): boolean {
    const i = this.indexOfCurrent();
    return i > 0;
  }

  hasNext(): boolean {
    const i = this.indexOfCurrent();
    return i >= 0 && i < this.allLessons().length - 1;
  }

  prev(): void {
    const i = this.indexOfCurrent();
    if (i > 0) this.currentLesson.set(this.allLessons()[i - 1]);
  }

  next(): void {
    const i = this.indexOfCurrent();
    if (i >= 0 && i < this.allLessons().length - 1) {
      this.currentLesson.set(this.allLessons()[i + 1]);
    }
  }

  private indexOfCurrent(): number {
    const id = this.currentLesson()?.id;
    return id ? this.allLessons().findIndex((l) => l.id === id) : -1;
  }

  iconFor(t?: string): string {
    return ({ video: 'play_circle', pdf: 'picture_as_pdf', texte: 'article', lien: 'link', projet: 'code' } as Record<string, string>)[t ?? '']
      ?? 'play_circle';
  }
}
