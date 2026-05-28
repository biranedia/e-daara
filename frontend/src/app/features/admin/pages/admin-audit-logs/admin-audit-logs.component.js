var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
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
/**
 * Logs d'audit — cœur de la démonstration de souveraineté numérique (CDC §6.4).
 * Affiche QUI a fait QUOI, QUAND, DEPUIS QUELLE IP, sur QUELLE RESSOURCE.
 */
let AdminAuditLogsComponent = (() => {
    let _classDecorators = [Component({
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
          <input matInput [(ngModel)]="search" placeholder="Email, action, ressource..." />
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Module</mat-label>
          <mat-select [(ngModel)]="moduleFilter">
            <mat-option value="">Tous</mat-option>
            @for (m of modules(); track m) {
              <mat-option [value]="m">{{ m }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Statut</mat-label>
          <mat-select [(ngModel)]="statusFilter">
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
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminAuditLogsComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminAuditLogsComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        admin = inject(AdminService);
        cols = ['date', 'user', 'action', 'module', 'resource', 'ip', 'status'];
        logs = signal([]);
        loading = signal(true);
        search = '';
        moduleFilter = '';
        statusFilter = '';
        modules = computed(() => Array.from(new Set(this.logs().map((l) => l.module))).sort());
        filtered = computed(() => {
            const q = this.search.trim().toLowerCase();
            return this.logs().filter((l) => {
                if (this.moduleFilter && l.module !== this.moduleFilter)
                    return false;
                if (this.statusFilter && l.statut !== this.statusFilter)
                    return false;
                if (!q)
                    return true;
                return [l.email, l.action, l.module, l.resource_type, l.ip_address]
                    .some((v) => (v ?? '').toLowerCase().includes(q));
            });
        });
        ngOnInit() {
            this.load();
        }
        load() {
            this.loading.set(true);
            this.admin.auditLogs().subscribe({
                next: (res) => {
                    this.logs.set(res.data?.logs ?? []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        }
        statusClass(s) {
            return {
                success: 'bg-green-100 text-green-700',
                failure: 'bg-red-100 text-red-700',
                pending: 'bg-amber-100 text-amber-700'
            }[s] ?? 'bg-slate-100 text-slate-700';
        }
    };
    return AdminAuditLogsComponent = _classThis;
})();
export { AdminAuditLogsComponent };
