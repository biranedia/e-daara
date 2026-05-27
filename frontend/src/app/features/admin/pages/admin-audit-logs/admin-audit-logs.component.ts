import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminService } from '@core/services/admin.service';
import { AuditLog } from '@core/models';

/**
 * Logs d'audit — cœur de la démonstration de souveraineté numérique (CDC §6.4).
 * Affiche QUI a fait QUOI, QUAND, DEPUIS QUELLE IP, sur QUELLE RESSOURCE.
 */
@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark flex items-center gap-2">
          <mat-icon class="text-edaara-primary">security</mat-icon>
          Logs d'audit
        </h1>
        <p class="text-slate-500">
          Traçabilité complète des actions — preuve concrète de souveraineté numérique (loi sénégalaise n°2008-12)
        </p>
      </header>

      <!-- Filtres -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-end">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 min-w-[200px]">
          <mat-label>Rechercher</mat-label>
          <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="Email, action, ressource..." />
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Module</mat-label>
          <mat-select [ngModel]="moduleFilter()" (ngModelChange)="moduleFilter.set($event)">
            <mat-option value="">Tous</mat-option>
            @for (m of modules(); track m) {
              <mat-option [value]="m">{{ m }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Statut</mat-label>
          <mat-select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
            <mat-option value="">Tous</mat-option>
            <mat-option value="success">Succès</mat-option>
            <mat-option value="failure">Échec</mat-option>
            <mat-option value="pending">En attente</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button color="primary" (click)="load()">
          <mat-icon>refresh</mat-icon>
          Actualiser
        </button>
      </div>

      <!-- Compteur -->
      <div class="text-sm text-slate-500">
        <strong>{{ filtered().length }}</strong> log(s) affiché(s) sur {{ logs().length }} chargé(s)
      </div>

      <!-- Tableau -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table mat-table [dataSource]="filtered()" class="w-full">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date / Heure</th>
            <td mat-cell *matCellDef="let l" class="text-sm text-slate-700 font-mono">
              {{ l.created_at | date:'dd/MM/yy HH:mm:ss' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
            <td mat-cell *matCellDef="let l" class="text-sm">
              {{ l.email || '— anonyme —' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let l" class="text-sm">
              <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{{ l.action }}</code>
            </td>
          </ng-container>

          <ng-container matColumnDef="module">
            <th mat-header-cell *matHeaderCellDef>Module</th>
            <td mat-cell *matCellDef="let l" class="text-sm">
              <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">
                {{ l.module }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="resource">
            <th mat-header-cell *matHeaderCellDef>Ressource</th>
            <td mat-cell *matCellDef="let l" class="text-sm text-slate-600">
              {{ l.resource_type }}{{ l.resource_id ? ' #' + l.resource_id : '' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="ip">
            <th mat-header-cell *matHeaderCellDef>IP</th>
            <td mat-cell *matCellDef="let l" class="text-xs font-mono text-slate-600">
              {{ l.ip_address || '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let l">
              <span class="px-2 py-1 rounded-full text-xs font-medium"
                    [class]="statusClass(l.statut)">
                {{ l.statut }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>

        @if (filtered().length === 0 && !loading()) {
          <div class="text-center py-12 text-slate-500">Aucun log à afficher</div>
        }
      </div>
    </div>
  `
})
export class AdminAuditLogsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly cols = ['date', 'user', 'action', 'module', 'resource', 'ip', 'status'];
  protected readonly logs = signal<AuditLog[]>([]);
  protected readonly loading = signal(true);
  protected readonly search = signal('');
  protected readonly moduleFilter = signal('');
  protected readonly statusFilter = signal('');

  protected readonly modules = computed(() =>
    Array.from(new Set(this.logs().map((l) => l.module))).sort()
  );

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const mod = this.moduleFilter();
    const sta = this.statusFilter();
    return this.logs().filter((l) => {
      if (mod && l.module !== mod) return false;
      if (sta && l.statut !== sta) return false;
      if (!q) return true;
      return [l.email, l.action, l.module, l.resource_type, l.ip_address]
        .some((v) => (v ?? '').toLowerCase().includes(q));
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.auditLogs().subscribe({
      next: (res) => {
        this.logs.set(res.data?.logs ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  statusClass(s: string): string {
    return {
      success: 'bg-green-100 text-green-700',
      failure: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700'
    }[s] ?? 'bg-slate-100 text-slate-700';
  }
}
