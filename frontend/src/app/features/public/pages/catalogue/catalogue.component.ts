import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CourseService } from '@core/services/course.service';
import { Course } from '@core/models';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatButtonModule, MatChipsModule
  ],
  template: `
    <div class="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header>
        <h1 class="text-3xl md:text-4xl font-bold text-edaara-dark">Catalogue des cours</h1>
        <p class="text-slate-500 mt-2">
          Découvrez tous les cours publiés sur la plateforme E-DAARA.
        </p>
      </header>

      <!-- Filtres -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-end">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 min-w-[200px]">
          <mat-label>Rechercher un cours</mat-label>
          <input matInput [(ngModel)]="search" (ngModelChange)="reload()" placeholder="Titre, description..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Niveau</mat-label>
          <mat-select [(ngModel)]="level" (selectionChange)="reload()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="debutant">Débutant</mat-option>
            <mat-option value="intermediaire">Intermédiaire</mat-option>
            <mat-option value="avance">Avancé</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Catégorie</mat-label>
          <mat-select [(ngModel)]="categoryId" (selectionChange)="reload()">
            <mat-option [value]="null">Toutes</mat-option>
            @for (c of categories(); track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Résultats -->
      <div class="text-sm text-slate-500">
        <strong>{{ courses().length }}</strong> cours trouvé(s)
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (c of courses(); track c.id) {
          <a [routerLink]="['/courses', c.id]"
             class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow block">
            <div class="h-36 bg-gradient-to-br from-edaara-primary to-teal-700 flex items-center justify-center relative">
              <mat-icon class="!w-14 !h-14 !text-6xl text-white/80">menu_book</mat-icon>
              @if (c.niveau) {
                <span class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-edaara-dark">
                  {{ c.niveau }}
                </span>
              }
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-edaara-dark line-clamp-1">{{ c.titre }}</h3>
              <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ c.description || '—' }}</p>
              <div class="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>👤 {{ c.instructor_prenom }} {{ c.instructor_nom }}</span>
                <span>{{ c.nb_inscrits || 0 }} 👥</span>
              </div>
              @if (c.note_moyenne) {
                <div class="text-xs mt-1 text-edaara-accent">
                  ★ {{ c.note_moyenne | number:'1.1-1' }} / 5
                </div>
              }
            </div>
          </a>
        } @empty {
          <div class="col-span-full text-center py-16 text-slate-500">
            <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">search_off</mat-icon>
            <p class="mt-3">Aucun cours ne correspond à votre recherche.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class CatalogueComponent implements OnInit {
  private readonly courseService = inject(CourseService);

  protected readonly courses = signal<Course[]>([]);
  protected readonly categories = signal<{ id: number; name: string }[]>([]);
  protected search = '';
  protected level = '';
  protected categoryId: number | null = null;

  ngOnInit(): void {
    this.reload();
    this.courseService.listCategories().subscribe({
      next: (res) => this.categories.set(res.data?.categories ?? [])
    });
  }

  reload(): void {
    const params: Record<string, string | number> = { limit: 50 };
    if (this.search) params['search'] = this.search;
    if (this.level) params['level'] = this.level;
    if (this.categoryId) params['category_id'] = this.categoryId;
    this.courseService.listPublic(params).subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
  }
}
