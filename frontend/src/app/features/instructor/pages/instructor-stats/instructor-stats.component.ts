import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '@core/services/course.service';
import { Course } from '@core/models';

@Component({
  selector: 'app-instructor-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Statistiques de mes cours</h1>
        <p class="text-slate-500">Vue d'ensemble des inscriptions et notes</p>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-700">
            <tr>
              <th class="text-left p-3">Cours</th>
              <th class="text-left p-3">Statut</th>
              <th class="text-right p-3">Inscrits</th>
              <th class="text-right p-3">Note moy.</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (c of courses(); track c.id) {
              <tr>
                <td class="p-3 font-medium">{{ c.titre }}</td>
                <td class="p-3">{{ c.status }}</td>
                <td class="p-3 text-right">{{ c.nb_inscrits || 0 }}</td>
                <td class="p-3 text-right">{{ c.note_moyenne ? (c.note_moyenne | number:'1.1-2') : '—' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="p-12 text-center text-slate-500">Aucun cours</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InstructorStatsComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  protected readonly courses = signal<Course[]>([]);

  ngOnInit(): void {
    this.courseService.listMine().subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
  }
}
