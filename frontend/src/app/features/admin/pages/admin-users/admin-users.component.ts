import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';
import { AuthService } from '@core/services/auth.service';
import { AdminUserRow } from '@core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="space-y-4">
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Gestion des utilisateurs</h1>
          <p class="text-slate-500 text-sm">{{ filtered().length }} utilisateur(s) · {{ users().length }} au total</p>
        </div>
        <div class="relative">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-lg pointer-events-none">search</mat-icon>
          <input
            type="text"
            [(ngModel)]="search"
            placeholder="Rechercher par email, nom..."
            class="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-edaara-primary w-64 transition-colors"
          />
        </div>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table mat-table [dataSource]="filtered()" class="w-full">

          <!-- Utilisateur -->
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef class="text-xs text-slate-500 uppercase tracking-wider font-medium">Utilisateur</th>
            <td mat-cell *matCellDef="let u" class="py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-edaara-primary text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {{ ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase() }}
                </div>
                <div>
                  <p class="font-medium text-slate-800 text-sm">{{ u.prenom }} {{ u.nom }}</p>
                  <p class="text-xs text-slate-400">{{ u.email }}</p>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Rôles -->
          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef class="text-xs text-slate-500 uppercase tracking-wider font-medium">Rôles</th>
            <td mat-cell *matCellDef="let u">
              <div class="flex flex-wrap gap-1">
                @for (role of (u.roles ?? []); track role) {
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="roleClass(role)">
                    {{ role }}
                  </span>
                } @empty {
                  <span class="text-xs text-slate-400">—</span>
                }
              </div>
            </td>
          </ng-container>

          <!-- Statut -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="text-xs text-slate-500 uppercase tracking-wider font-medium">Statut</th>
            <td mat-cell *matCellDef="let u">
              <span class="px-2 py-1 rounded-full text-xs font-medium"
                    [class]="statusClass(u.status)">
                {{ statusLabel(u.status) }}
              </span>
            </td>
          </ng-container>

          <!-- Inscription -->
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef class="text-xs text-slate-500 uppercase tracking-wider font-medium">Inscrit le</th>
            <td mat-cell *matCellDef="let u" class="text-sm text-slate-600">
              {{ u.created_at | date:'dd/MM/yyyy' }}
            </td>
          </ng-container>

          <!-- Dernière connexion -->
          <ng-container matColumnDef="last_login">
            <th mat-header-cell *matHeaderCellDef class="text-xs text-slate-500 uppercase tracking-wider font-medium">Dernière connexion</th>
            <td mat-cell *matCellDef="let u" class="text-sm text-slate-500">
              {{ u.last_login_at ? (u.last_login_at | date:'dd/MM/yyyy HH:mm') : '—' }}
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let u" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <!-- Statut -->
                <p class="px-4 py-1 text-xs text-slate-400 uppercase tracking-wider font-medium">Statut</p>
                <button mat-menu-item (click)="setStatus(u, 'active')" [disabled]="u.status === 'active'">
                  <mat-icon class="text-green-600">check_circle</mat-icon> Activer
                </button>
                <button mat-menu-item (click)="setStatus(u, 'inactive')" [disabled]="u.status === 'inactive'">
                  <mat-icon class="text-slate-500">pause_circle</mat-icon> Désactiver
                </button>
                <button mat-menu-item (click)="setStatus(u, 'suspended')" [disabled]="u.status === 'suspended'">
                  <mat-icon class="text-red-600">block</mat-icon> Suspendre
                </button>
                <!-- Rôles -->
                <div class="border-t border-slate-100 mt-1 pt-1">
                  <p class="px-4 py-1 text-xs text-slate-400 uppercase tracking-wider font-medium">Rôles</p>
                  <button mat-menu-item (click)="toggleRole(u, 'instructor')">
                    <mat-icon [class]="hasRole(u, 'instructor') ? 'text-edaara-primary' : 'text-slate-400'">
                      {{ hasRole(u, 'instructor') ? 'school' : 'person_add' }}
                    </mat-icon>
                    {{ hasRole(u, 'instructor') ? 'Retirer formateur' : 'Nommer formateur' }}
                  </button>
                  <button mat-menu-item (click)="toggleRole(u, 'admin')"
                          [disabled]="u.id === auth.currentUser()?.id">
                    <mat-icon [class]="hasRole(u, 'admin') ? 'text-purple-600' : 'text-slate-400'">
                      {{ hasRole(u, 'admin') ? 'admin_panel_settings' : 'person_add' }}
                    </mat-icon>
                    {{ hasRole(u, 'admin') ? 'Retirer admin' : 'Nommer admin' }}
                  </button>
                </div>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;" class="hover:bg-slate-50 transition-colors"></tr>
        </table>

        @if (filtered().length === 0 && !loading()) {
          <div class="text-center py-12 text-slate-400">
            <mat-icon class="!w-12 !h-12 !text-5xl">person_search</mat-icon>
            <p class="mt-2 text-sm">Aucun utilisateur trouvé</p>
          </div>
        }
        @if (loading()) {
          <div class="text-center py-12 text-slate-400 text-sm">Chargement…</div>
        }
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);
  protected readonly auth = inject(AuthService);

  protected readonly cols = ['user', 'roles', 'status', 'created', 'last_login', 'actions'];
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
        this.snack.open(`Statut mis à jour : ${this.statusLabel(status)}`, 'OK', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Erreur lors de la mise à jour', 'OK', { duration: 3000 })
    });
  }

  hasRole(u: AdminUserRow, role: string): boolean {
    return (u.roles ?? []).includes(role);
  }

  toggleRole(u: AdminUserRow, role: string): void {
    const current = u.roles ?? [];
    const newRoles = current.includes(role)
      ? current.filter(r => r !== role)
      : [...current, role];
    this.admin.assignRoles(u.id, newRoles).subscribe({
      next: () => {
        const verb = current.includes(role) ? 'retiré' : 'ajouté';
        this.snack.open(`Rôle "${role}" ${verb} pour ${u.prenom} ${u.nom}`, 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snack.open('Erreur lors de la mise à jour des rôles', 'OK', { duration: 3000 })
    });
  }

  statusClass(s: string): string {
    return ({
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-slate-100 text-slate-700',
      suspended: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700'
    } as Record<string, string>)[s] ?? 'bg-slate-100 text-slate-700';
  }

  statusLabel(s: string): string {
    return ({ active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu', pending: 'En attente' } as Record<string, string>)[s] ?? s;
  }

  roleClass(role: string): string {
    return ({
      admin: 'bg-purple-100 text-purple-700',
      instructor: 'bg-blue-100 text-blue-700',
      student: 'bg-teal-100 text-teal-700'
    } as Record<string, string>)[role] ?? 'bg-slate-100 text-slate-600';
  }
}
