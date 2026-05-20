import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';
import { AdminUserRow } from '@core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatMenuModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="space-y-4">
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Gestion des utilisateurs</h1>
          <p class="text-slate-500">{{ filtered().length }} utilisateur(s)</p>
        </div>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="search" placeholder="Email, nom..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table mat-table [dataSource]="filtered()" class="w-full">
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-edaara-primary text-white flex items-center justify-center text-sm font-semibold">
                  {{ (u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '') }}
                </div>
                <div>
                  <p class="font-medium text-slate-800">{{ u.prenom }} {{ u.nom }}</p>
                  <p class="text-xs text-slate-500">{{ u.email }}</p>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let u">
              <span class="px-2 py-1 rounded-full text-xs font-medium"
                    [class]="statusClass(u.status)">
                {{ u.status }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Inscription</th>
            <td mat-cell *matCellDef="let u" class="text-sm text-slate-600">
              {{ u.created_at | date:'dd/MM/yyyy' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="last_login">
            <th mat-header-cell *matHeaderCellDef>Dernière connexion</th>
            <td mat-cell *matCellDef="let u" class="text-sm text-slate-600">
              {{ u.last_login_at ? (u.last_login_at | date:'dd/MM/yyyy HH:mm') : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right"></th>
            <td mat-cell *matCellDef="let u" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu"
                      aria-label="Actions utilisateur">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="setStatus(u, 'active')" [disabled]="u.status === 'active'">
                  <mat-icon class="text-green-600">check_circle</mat-icon>Activer
                </button>
                <button mat-menu-item (click)="setStatus(u, 'inactive')" [disabled]="u.status === 'inactive'">
                  <mat-icon class="text-slate-500">pause_circle</mat-icon>Désactiver
                </button>
                <button mat-menu-item (click)="setStatus(u, 'suspended')" [disabled]="u.status === 'suspended'">
                  <mat-icon class="text-red-600">block</mat-icon>Suspendre
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>

        @if (filtered().length === 0 && !loading()) {
          <div class="text-center py-12 text-slate-500">
            Aucun utilisateur trouvé
          </div>
        }
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);

  protected readonly cols = ['email', 'status', 'created', 'last_login', 'actions'];
  protected readonly users = signal<AdminUserRow[]>([]);
  protected readonly loading = signal(true);
  protected search = '';

  protected readonly filtered = computed(() => {
    const q = this.search.trim().toLowerCase();
    const list = this.users();
    if (!q) return list;
    return list.filter((u) =>
      [u.email, u.nom, u.prenom].some((v) => (v ?? '').toLowerCase().includes(q))
    );
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.admin.listUsers().subscribe({
      next: (res) => {
        this.users.set(res.data?.users ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setStatus(u: AdminUserRow, status: AdminUserRow['status']): void {
    this.admin.updateUserStatus(u.id, status).subscribe({
      next: () => {
        this.snack.open(`Utilisateur ${status}`, 'OK', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Erreur lors de la mise à jour', 'OK', { duration: 3000 })
    });
  }

  statusClass(s: string): string {
    return {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-slate-100 text-slate-700',
      suspended: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700'
    }[s] ?? 'bg-slate-100 text-slate-700';
  }
}
