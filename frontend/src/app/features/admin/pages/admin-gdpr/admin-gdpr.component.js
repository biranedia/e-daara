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
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';
let AdminGdprComponent = (() => {
    let _classDecorators = [Component({
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
            <td mat-cell *matCellDef="let r">
              <span class="text-sm font-medium text-edaara-dark">{{ r.user_email || ('#' + r.user_id) }}</span>
            </td>
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
                <button mat-menu-item (click)="setStatus(r, 'processing')">En cours</button>
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
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminGdprComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminGdprComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        admin = inject(AdminService);
        snack = inject(MatSnackBar);
        cols = ['date', 'user', 'type', 'status', 'motif', 'actions'];
        requests = signal([]);
        ngOnInit() {
            this.load();
        }
        load() {
            this.admin.allGdprRequests().subscribe({
                next: (res) => this.requests.set(res.data?.requests ?? [])
            });
        }
        setStatus(r, status) {
            this.admin.updateGdprStatus(r.id, status).subscribe({
                next: () => {
                    this.snack.open('Statut mis à jour', 'OK', { duration: 2000 });
                    this.load();
                }
            });
        }
        statusClass(s) {
            return {
                pending: 'bg-amber-100 text-amber-700',
                processing: 'bg-blue-100 text-blue-700',
                completed: 'bg-green-100 text-green-700',
                rejected: 'bg-red-100 text-red-700'
            }[s] ?? 'bg-slate-100 text-slate-700';
        }
    };
    return AdminGdprComponent = _classThis;
})();
export { AdminGdprComponent };
