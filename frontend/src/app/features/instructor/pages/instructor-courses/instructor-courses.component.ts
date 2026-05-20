import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '@core/services/course.service';
import { Course } from '@core/models';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <div class="space-y-4">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Mes cours</h1>
          <p class="text-slate-500">{{ courses().length }} cours au total</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/instructor/courses/new">
          <mat-icon>add</mat-icon> Nouveau cours
        </a>
      </header>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (c of courses(); track c.id) {
          <article class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div class="h-28 bg-gradient-to-br from-edaara-primary to-teal-700 flex items-center justify-center">
              <mat-icon class="!w-12 !h-12 !text-5xl text-white/80">menu_book</mat-icon>
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-bold text-edaara-dark line-clamp-2">{{ c.titre }}</h3>
                <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['/instructor/courses', c.id]">
                    <mat-icon>edit</mat-icon>Modifier
                  </a>
                  <a mat-menu-item [routerLink]="['/instructor/courses', c.id, 'sections']">
                    <mat-icon>list</mat-icon>Sections & leçons
                  </a>
                  <button mat-menu-item (click)="remove(c)" class="!text-red-600">
                    <mat-icon class="!text-red-600">delete</mat-icon>Supprimer
                  </button>
                </mat-menu>
              </div>
              <p class="text-sm text-slate-600 line-clamp-2 mt-1 flex-1">
                {{ c.description || 'Pas de description' }}
              </p>
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span class="text-xs px-2 py-1 rounded-full" [class]="statusClass(c.status)">
                  {{ c.status }}
                </span>
                <span class="text-xs text-slate-500">{{ c.nb_inscrits || 0 }} inscrits</span>
              </div>
            </div>
          </article>
        } @empty {
          <div class="col-span-full bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
            <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">menu_book</mat-icon>
            <p class="text-slate-600 mt-3">Vous n'avez encore créé aucun cours.</p>
            <a mat-flat-button color="primary" routerLink="/instructor/courses/new" class="mt-4">
              Créer mon premier cours
            </a>
          </div>
        }
      </div>
    </div>
  `
})
export class InstructorCoursesComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  private readonly snack = inject(MatSnackBar);

  protected readonly courses = signal<Course[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.courseService.listMine().subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
  }

  remove(c: Course): void {
    if (!confirm(`Supprimer définitivement "${c.titre}" ?`)) return;
    this.courseService.delete(c.id).subscribe({
      next: () => {
        this.snack.open('Cours supprimé', 'OK', { duration: 2000 });
        this.load();
      }
    });
  }

  statusClass(s?: string): string {
    return {
      published: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      draft: 'bg-slate-100 text-slate-700',
      archived: 'bg-red-100 text-red-700'
    }[s ?? 'draft'] ?? 'bg-slate-100 text-slate-700';
  }
}
