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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';
/**
 * Page de validation automatique des cours.
 *
 * Depuis que la validation est entièrement automatique (déclenchée au moment où
 * le formateur soumet son cours), cette page est devenue un tableau de bord
 * d'audit : elle affiche l'historique de toutes les décisions (approuvées ou
 * refusées) avec les critères détaillés.
 *
 * Un admin peut toujours corriger manuellement un cours refusé via le bouton
 * « Forcer l'approbation » (route POST /admin/courses/:id/validate).
 */
let AdminCoursesPendingComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-admin-courses-pending',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
            template: `
    <div class="space-y-6">
      <!-- En-tête -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark flex items-center gap-2">
            <mat-icon class="text-edaara-primary">auto_awesome</mat-icon>
            Validation automatique des cours
          </h1>
          <p class="text-slate-500 mt-1">
            Les cours sont validés automatiquement à la soumission selon 9 critères qualité.
          </p>
        </div>
        <button mat-stroked-button (click)="load()">
          <mat-icon>refresh</mat-icon> Actualiser
        </button>
      </header>

      <!-- Compteurs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p class="text-3xl font-bold text-edaara-primary">{{ validations().length }}</p>
          <p class="text-xs text-slate-500 mt-1">Total soumissions</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p class="text-3xl font-bold text-green-600">{{ approvedAutoCount() }}</p>
          <p class="text-xs text-slate-500 mt-1">Approuvés auto</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p class="text-3xl font-bold text-red-500">{{ rejectedAutoCount() }}</p>
          <p class="text-xs text-slate-500 mt-1">Refusés auto</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p class="text-3xl font-bold text-amber-500">{{ manualCount() }}</p>
          <p class="text-xs text-slate-500 mt-1">Décisions manuelles</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="flex flex-wrap gap-2">
        @for (f of filters; track f.value) {
          <button (click)="activeFilter.set(f.value)"
                  class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  [class]="activeFilter() === f.value
                    ? 'bg-edaara-primary text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'">
            {{ f.label }}
          </button>
        }
      </div>

      <!-- Liste -->
      @if (filtered().length === 0) {
        <div class="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <mat-icon class="!w-16 !h-16 !text-6xl text-slate-300">fact_check</mat-icon>
          <p class="text-slate-500 mt-3">Aucune validation à afficher.</p>
        </div>
      } @else {
        <div class="grid gap-3">
          @for (v of filtered(); track v.id) {
            <article class="bg-white rounded-xl shadow-sm border"
                     [class.border-green-200]="v.decision === 'approved'"
                     [class.border-red-200]="v.decision === 'rejected'">
              <div class="p-5">
                <div class="flex flex-col md:flex-row md:items-start gap-4">

                  <!-- Icône décision -->
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center"
                         [class.bg-green-100]="v.decision === 'approved'"
                         [class.bg-red-100]="v.decision === 'rejected'">
                      <mat-icon [class.text-green-600]="v.decision === 'approved'"
                                [class.text-red-500]="v.decision === 'rejected'">
                        {{ v.decision === 'approved' ? 'check_circle' : 'cancel' }}
                      </mat-icon>
                    </div>
                  </div>

                  <!-- Infos cours -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <h3 class="font-bold text-edaara-dark truncate">
                        {{ v.course_titre || ('Cours #' + v.course_id) }}
                      </h3>
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                            [class.bg-green-100]="v.decision === 'approved'"
                            [class.text-green-700]="v.decision === 'approved'"
                            [class.bg-red-100]="v.decision === 'rejected'"
                            [class.text-red-600]="v.decision === 'rejected'">
                        {{ v.decision === 'approved' ? 'Approuvé' : 'Refusé' }}
                      </span>
                      <span class="px-2 py-0.5 rounded-full text-xs"
                            [class.bg-purple-50]="v.source === 'auto'"
                            [class.text-purple-600]="v.source === 'auto'"
                            [class.bg-slate-100]="v.source === 'manual'"
                            [class.text-slate-600]="v.source === 'manual'">
                        {{ v.source === 'auto' ? '✨ Auto' : '👤 Manuel' }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-500">
                      👤 {{ v.instructor_prenom }} {{ v.instructor_nom }}
                      &nbsp;·&nbsp;
                      🕐 {{ v.created_at | date:'dd/MM/yyyy HH:mm' }}
                    </p>

                    @if (v.commentaire) {
                      <div class="mt-3 p-3 rounded-lg text-sm whitespace-pre-wrap"
                           [class.bg-red-50]="v.decision === 'rejected'"
                           [class.text-red-700]="v.decision === 'rejected'"
                           [class.bg-green-50]="v.decision === 'approved'"
                           [class.text-green-700]="v.decision === 'approved'">
                        {{ v.commentaire }}
                      </div>
                    }
                  </div>

                  <!-- Forcer l'approbation (refus auto uniquement) -->
                  @if (v.decision === 'rejected' && v.source === 'auto' && v.course_status !== 'published') {
                    <div class="flex-shrink-0">
                      <button mat-stroked-button color="primary"
                              (click)="forceApprove(v)"
                              [disabled]="processing() === v.course_id"
                              matTooltip="Contourner la validation automatique et publier ce cours">
                        <mat-icon>verified</mat-icon>
                        Forcer l'approbation
                      </button>
                    </div>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminCoursesPendingComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminCoursesPendingComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        admin = inject(AdminService);
        snack = inject(MatSnackBar);
        validations = signal([]);
        processing = signal(null);
        activeFilter = signal('all');
        filters = [
            { value: 'all', label: 'Tout voir' },
            { value: 'approved', label: '✅ Approuvés' },
            { value: 'rejected', label: '❌ Refusés' },
            { value: 'auto', label: '✨ Automatique' },
            { value: 'manual', label: '👤 Manuel' }
        ];
        filtered() {
            const f = this.activeFilter();
            const all = this.validations();
            switch (f) {
                case 'approved': return all.filter(v => v.decision === 'approved');
                case 'rejected': return all.filter(v => v.decision === 'rejected');
                case 'auto': return all.filter(v => v.source === 'auto');
                case 'manual': return all.filter(v => v.source === 'manual');
                default: return all;
            }
        }
        approvedAutoCount() {
            return this.validations().filter(v => v.decision === 'approved' && v.source === 'auto').length;
        }
        rejectedAutoCount() {
            return this.validations().filter(v => v.decision === 'rejected' && v.source === 'auto').length;
        }
        manualCount() {
            return this.validations().filter(v => v.source === 'manual').length;
        }
        ngOnInit() {
            this.load();
        }
        load() {
            this.admin.validationHistory().subscribe({
                next: (res) => this.validations.set(res.data?.validations ?? [])
            });
        }
        forceApprove(v) {
            this.processing.set(v.course_id);
            this.admin.validateCourse(v.course_id, 'approved', 'Approbation manuelle par un administrateur (contournement validation automatique).').subscribe({
                next: () => {
                    this.processing.set(null);
                    this.snack.open(`"${v.course_titre}" approuvé et publié`, 'OK', { duration: 2500 });
                    this.load();
                },
                error: () => {
                    this.processing.set(null);
                    this.snack.open("Erreur lors de l'approbation", 'OK', { duration: 3000 });
                }
            });
        }
    };
    return AdminCoursesPendingComponent = _classThis;
})();
export { AdminCoursesPendingComponent };
