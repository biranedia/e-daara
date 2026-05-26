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
          <p class="text-slate-500 text-sm">{{ courses().length }} cours au total</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/instructor/courses/new">
          <mat-icon>add</mat-icon> Nouveau cours
        </a>
      </header>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (c of courses(); track c.id) {
          <article class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div class="h-28 bg-gradient-to-br from-edaara-primary to-teal-700 flex items-center justify-center relative">
              <mat-icon class="!w-12 !h-12 !text-5xl text-white/80">menu_book</mat-icon>
              <!-- Badge statut -->
              <span class="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="statusClass(c.status)">
                {{ statusLabel(c.status) }}
              </span>
            </div>

            <div class="p-4 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-bold text-edaara-dark line-clamp-2 flex-1">{{ c.titre }}</h3>
                <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['/instructor/courses', c.id]">
                    <mat-icon>edit</mat-icon> Modifier
                  </a>
                  <a mat-menu-item [routerLink]="['/instructor/courses', c.id, 'sections']">
                    <mat-icon>list</mat-icon> Sections & leçons
                  </a>
                  <button mat-menu-item (click)="remove(c)" class="!text-red-600"
                          [disabled]="c.status === 'published'">
                    <mat-icon class="!text-red-600">delete</mat-icon> Supprimer
                  </button>
                </mat-menu>
              </div>

              <p class="text-sm text-slate-500 line-clamp-2 mt-1 flex-1">
                {{ c.description || 'Pas de description' }}
              </p>

              <div class="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>{{ c.nb_inscrits || 0 }} inscrits</span>
                  @if (c.niveau) {
                    <span class="capitalize">{{ c.niveau }}</span>
                  }
                </div>

                <!-- Bouton soumettre uniquement pour les brouillons -->
                @if (c.status === 'draft') {
                  <button
                    mat-flat-button
                    color="primary"
                    class="w-full !text-sm"
                    [disabled]="submitting() === c.id"
                    (click)="submit(c)">
                    <mat-icon>send</mat-icon>
                    {{ submitting() === c.id ? 'Envoi…' : 'Soumettre pour validation' }}
                  </button>
                }

                @if (c.status === 'pending') {
                  <div class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    <mat-icon class="!text-sm">hourglass_empty</mat-icon>
                    En attente de validation par l'admin
                  </div>
                }

                @if (c.status === 'published') {
                  <div class="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <mat-icon class="!text-sm">check_circle</mat-icon>
                    Publié et accessible aux apprenants
                  </div>
                }
              </div>
            </div>
          </article>
        } @empty {
          <div class="col-span-full bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
            <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">menu_book</mat-icon>
            <p class="text-slate-600 mt-3 font-medium">Vous n'avez encore créé aucun cours.</p>
            <p class="text-slate-400 text-sm mt-1">Commencez par créer votre premier cours.</p>
            <a mat-flat-button color="primary" routerLink="/instructor/courses/new" class="mt-4">
              <mat-icon>add</mat-icon> Créer mon premier cours
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
  protected readonly submitting = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.courseService.listMine().subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
  }

  submit(c: Course): void {
    this.submitting.set(c.id);
    this.courseService.submit(c.id).subscribe({
      next: (res) => {
        this.submitting.set(null);
        if (res.decision === 'approved') {
          this.snack.open(`✅ "${c.titre}" validé automatiquement — il est maintenant publié !`, 'OK', { duration: 5000 });
        } else if (res.decision === 'rejected') {
          const raisons = res.failed_criteria?.length
            ? ` Critères manquants : ${res.failed_criteria.join(', ')}`
            : '';
          this.snack.open(`❌ "${c.titre}" refusé automatiquement.${raisons}`, 'Fermer', { duration: 8000 });
        } else {
          this.snack.open(res.message ?? `"${c.titre}" soumis`, 'OK', { duration: 3000 });
        }
        this.load();
      },
      error: (err) => {
        this.submitting.set(null);
        this.snack.open(err?.error?.message ?? 'Erreur lors de la soumission', 'OK', { duration: 3000 });
      }
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
    return ({
      published: 'bg-green-100 text-green-700',
      pending:   'bg-amber-100 text-amber-700',
      draft:     'bg-slate-100 text-slate-600',
      rejected:  'bg-red-100 text-red-600'
    } as Record<string, string>)[s ?? ''] ?? 'bg-slate-100 text-slate-600';
  }

  statusLabel(s?: string): string {
    return ({
      published: 'Publié',
      pending:   'En attente',
      draft:     'Brouillon',
      rejected:  'Refusé'
    } as Record<string, string>)[s ?? ''] ?? s ?? '';
  }
}
