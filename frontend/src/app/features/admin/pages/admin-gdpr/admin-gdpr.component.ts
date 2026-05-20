import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';
import { GdprRequest } from '@core/models';

@Component({
  selector: 'app-admin-gdpr',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatMenuModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark flex items-center gap-2">
          <mat-icon class="text-edaara-accent">privacy_tip</mat-icon>
          Demandes RGPD / CDP
        </h1>
        <p class="text-slate-500">
          Conformité Loi sénégalaise n°2008-12 sur les données personnelles
        </p>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table mat-table [dataSource]="requests()" class="w-full">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let r">{{ r.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
            <td mat-cell *matCellDef="let r">#{{ r.user_id }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let r">
              <span class="px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">{{ r.type }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let r">
              <span class="px-2 py-1 rounded-full text-xs"
                    [class]="statusClass((r.statut || r.status))">{{ (r.statut || r.status) }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="motif">
            <th mat-header-cell *matHeaderCellDef>Motif</th>
            <td mat-cell *matCellDef="let r" class="text-sm text-slate-600">{{ r.detail || r.motif || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              <button mat-icon-button [matMenuTriggerFor]="m" aria-label="Changer le statut">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #m="matMenu">
                <button mat-menu-item (click)="setStatus(r, 'in_progress')">En cours</button>
                <button mat-menu-item (click)="setStatus(r, 'completed')">Terminée</button>
                <button mat-menu-item (click)="setStatus(r, 'rejected')">Rejetée</button>
              </mat-menu>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        @if (requests().length === 0) {
          <p class="text-center py-12 text-slate-500">Aucune demande RGPD</p>
        }
      </div>
    </div>
  `
})
export class AdminGdprComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);

  protected readonly cols = ['date', 'user', 'type', 'status', 'motif', 'actions'];
  protected readonly requests = signal<GdprRequest[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.admin.allGdprRequests().subscribe({
      next: (res) => this.requests.set(res.data?.requests ?? [])
    });
  }

  setStatus(r: GdprRequest, status: GdprRequest['status']): void {
    this.admin.updateGdprStatus(r.id, status).subscribe({
      next: () => {
        this.snack.open('Statut mis à jour', 'OK', { duration: 2000 });
        this.load();
      }
    });
  }

  statusClass(s: string): string {
    return {
      pending: 'bg-amber-100 text-amber-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    }[s] ?? 'bg-slate-100 text-slate-700';
  }
}
