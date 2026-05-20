import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Statistiques globales</h1>
          <p class="text-slate-500">Données agrégées de la plateforme</p>
        </div>
        <button mat-flat-button color="primary" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
          Recalculer
        </button>
      </header>

      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <pre class="text-xs overflow-x-auto">{{ raw() | json }}</pre>
      </div>
    </div>
  `
})
export class AdminStatsComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);

  protected readonly raw = signal<unknown>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.admin.latestStats().subscribe({
      next: (res) => this.raw.set(res.data ?? res)
    });
  }

  refresh(): void {
    this.admin.refreshStats().subscribe({
      next: () => {
        this.snack.open('Statistiques recalculées', 'OK', { duration: 2000 });
        this.load();
      }
    });
  }
}
