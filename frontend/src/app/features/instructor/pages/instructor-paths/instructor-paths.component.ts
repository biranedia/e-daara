import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PathService } from '@core/services/path.service';
import { Path } from '@core/models';

@Component({
  selector: 'app-instructor-paths',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Parcours d'apprentissage</h1>
        <p class="text-slate-500">Regroupez plusieurs cours en parcours guidé</p>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h3 class="font-semibold mb-2">Nouveau parcours</h3>
        <div class="flex gap-2">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
            <input matInput [(ngModel)]="newTitle" placeholder="Titre du parcours" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="create()">
            <mat-icon>add</mat-icon> Créer
          </button>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-3">
        @for (p of paths(); track p.id) {
          <article class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 class="font-semibold text-edaara-dark">{{ p.titre }}</h3>
            <p class="text-sm text-slate-600 mt-1">{{ p.description || 'Pas de description' }}</p>
            <div class="flex gap-2 mt-3 text-xs text-slate-500">
              <span>{{ p.duree_estimee || '?' }} h</span>
              <span>·</span>
              <span>{{ p.niveau || 'tous niveaux' }}</span>
            </div>
          </article>
        } @empty {
          <p class="col-span-full text-center py-12 text-slate-500">Aucun parcours</p>
        }
      </div>
    </div>
  `
})
export class InstructorPathsComponent implements OnInit {
  private readonly pathService = inject(PathService);
  private readonly snack = inject(MatSnackBar);

  protected readonly paths = signal<Path[]>([]);
  protected newTitle = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.pathService.list().subscribe({
      next: (res) => this.paths.set(res.data?.paths ?? [])
    });
  }

  create(): void {
    if (!this.newTitle.trim()) return;
    this.pathService.create({ titre: this.newTitle }).subscribe({
      next: () => {
        this.newTitle = '';
        this.snack.open('Parcours créé', 'OK', { duration: 1500 });
        this.load();
      }
    });
  }
}
