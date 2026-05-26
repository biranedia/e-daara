import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PathService } from '@core/services/path.service';
import { Path } from '@core/models';

@Component({
  selector: 'app-student-paths',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Mes parcours</h1>
        <p class="text-slate-500">{{ paths().length }} parcours suivi(s)</p>
      </header>

      <div class="grid sm:grid-cols-2 gap-4">
        @for (p of paths(); track p.id) {
          <article class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center gap-3 mb-2">
              <mat-icon class="text-edaara-primary">route</mat-icon>
              <h3 class="font-semibold text-edaara-dark">{{ p.titre }}</h3>
            </div>
            <p class="text-sm text-slate-600">{{ p.description }}</p>
          </article>
        } @empty {
          <p class="col-span-full text-center py-12 text-slate-500">Aucun parcours suivi</p>
        }
      </div>
    </div>
  `
})
export class StudentPathsComponent implements OnInit {
  private readonly pathService = inject(PathService);
  protected readonly paths = signal<Path[]>([]);

  ngOnInit(): void {
    this.pathService.list().subscribe({
      next: (res) => this.paths.set(res.data?.paths ?? [])
    });
  }
}
