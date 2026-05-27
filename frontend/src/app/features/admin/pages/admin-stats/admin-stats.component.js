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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '@core/services/admin.service';
let AdminStatsComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-admin-stats',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
            template: `
    <div class="space-y-5">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Statistiques globales</h1>
          <p class="text-slate-500 text-sm">Données agrégées · dernier snapshot : {{ snapshotDate() }}</p>
        </div>
        <button mat-flat-button color="primary" (click)="refresh()" [disabled]="refreshing()">
          <mat-icon>{{ refreshing() ? 'hourglass_top' : 'refresh' }}</mat-icon>
          Recalculer
        </button>
      </header>

      @if (loading()) {
        <div class="flex justify-center py-12"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (snap()) {

        <!-- KPI GRID -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (kpi of kpis(); track kpi.label) {
            <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" [style.background-color]="kpi.bg">
                  <mat-icon class="!text-base" [style.color]="kpi.color">{{ kpi.icon }}</mat-icon>
                </div>
                <span class="text-xs text-slate-500 uppercase tracking-wider">{{ kpi.label }}</span>
              </div>
              <p class="text-3xl font-bold text-edaara-dark">{{ kpi.value }}</p>
              @if (kpi.sub) {
                <p class="text-xs text-slate-400 mt-1">{{ kpi.sub }}</p>
              }
            </div>
          }
        </div>

        <!-- HISTORICAL CHART -->
        @if (history().length > 1) {
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 class="font-semibold text-edaara-dark text-sm mb-4">
              Évolution ({{ history().length }} snapshots)
            </h3>
            <div class="flex items-end gap-1 h-28 overflow-x-auto pb-2">
              @for (s of history(); track s.snap_date; let i = $index) {
                <div class="flex flex-col items-center gap-1 flex-shrink-0 group" style="min-width:28px">
                  <!-- Users bar -->
                  <div class="relative w-4 bg-slate-100 rounded-sm overflow-hidden"
                       [style.height.px]="barH(s.total_users, maxHistory())"
                       title="{{ s.snap_date }}: {{ s.total_users }} users">
                    <div class="absolute bottom-0 left-0 right-0 bg-blue-400 rounded-sm"
                         [style.height.%]="100"></div>
                  </div>
                  <!-- Enrollments bar -->
                  <div class="relative w-4 bg-slate-100 rounded-sm overflow-hidden"
                       [style.height.px]="barH(s.total_inscriptions, maxHistory())"
                       title="{{ s.snap_date }}: {{ s.total_inscriptions }} inscriptions">
                    <div class="absolute bottom-0 left-0 right-0 bg-amber-400 rounded-sm"
                         [style.height.%]="100"></div>
                  </div>
                  @if (i === 0 || i === history().length - 1) {
                    <span class="text-xs text-slate-400 rotate-45 origin-left mt-1" style="font-size:9px">
                      {{ s.snap_date | date:'dd/MM' }}
                    </span>
                  }
                </div>
              }
            </div>
            <!-- Legend -->
            <div class="flex gap-4 mt-3 text-xs text-slate-500">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-sm bg-blue-400 inline-block"></span> Utilisateurs
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-sm bg-amber-400 inline-block"></span> Inscriptions
              </span>
            </div>
          </div>
        }

        <!-- DETAILS TABLE -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Métrique</th>
                <th class="text-right px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Valeur</th>
                <th class="px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider text-right">Tendance</th>
              </tr>
            </thead>
            <tbody>
              @for (row of tableRows(); track row.label) {
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                  <td class="px-5 py-3 font-medium text-edaara-dark">{{ row.label }}</td>
                  <td class="px-5 py-3 text-right font-bold text-edaara-dark">{{ row.value }}</td>
                  <td class="px-5 py-3">
                    <div class="flex items-center justify-end gap-2">
                      <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full" [style.width.%]="row.pct" [style.background-color]="row.color"></div>
                      </div>
                      <span class="text-xs text-slate-400 w-8 text-right">{{ row.pct }}%</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      } @else {
        <div class="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
          <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">bar_chart</mat-icon>
          <p class="text-slate-500 mt-3">Aucun snapshot disponible.</p>
          <button mat-flat-button color="primary" (click)="refresh()" class="mt-4">
            Générer maintenant
          </button>
        </div>
      }
    </div>
  `
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminStatsComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminStatsComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        admin = inject(AdminService);
        snack = inject(MatSnackBar);
        snap = signal(null);
        history = signal([]);
        loading = signal(true);
        refreshing = signal(false);
        snapshotDate = computed(() => this.snap() ? new Date(this.snap().snap_date).toLocaleDateString('fr-FR') : '—');
        maxHistory = computed(() => Math.max(...this.history().map(s => Math.max(s.total_users, s.total_inscriptions)), 1));
        kpis = computed(() => {
            const s = this.snap();
            if (!s)
                return [];
            return [
                { label: 'Utilisateurs', value: s.total_users, icon: 'people', color: '#3b82f6', bg: '#eff6ff', sub: 'inscrits sur la plateforme' },
                { label: 'Apprenants', value: s.total_apprenants, icon: 'school', color: '#0d9488', bg: '#f0fdfa', sub: null },
                { label: 'Formateurs', value: s.total_formateurs, icon: 'record_voice_over', color: '#8b5cf6', bg: '#f5f3ff', sub: null },
                { label: 'Cours', value: s.total_cours, icon: 'menu_book', color: '#f59e0b', bg: '#fffbeb', sub: null },
                { label: 'Inscriptions', value: s.total_inscriptions, icon: 'how_to_reg', color: '#10b981', bg: '#f0fdf4', sub: null },
                { label: 'Complétions', value: s.total_completions, icon: 'check_circle', color: '#059669', bg: '#ecfdf5', sub: `${this.pct(s.total_completions, s.total_inscriptions)}% des inscrits` },
                { label: 'Quiz passés', value: s.total_quizzes, icon: 'quiz', color: '#6366f1', bg: '#eef2ff', sub: null },
            ];
        });
        tableRows = computed(() => {
            const s = this.snap();
            if (!s)
                return [];
            const max = Math.max(s.total_users, s.total_inscriptions, s.total_quizzes, 1);
            return [
                { label: 'Total utilisateurs', value: s.total_users, pct: this.pct(s.total_users, max), color: '#3b82f6' },
                { label: 'Apprenants', value: s.total_apprenants, pct: this.pct(s.total_apprenants, s.total_users), color: '#0d9488' },
                { label: 'Formateurs', value: s.total_formateurs, pct: this.pct(s.total_formateurs, s.total_users), color: '#8b5cf6' },
                { label: 'Cours publiés', value: s.total_cours, pct: this.pct(s.total_cours, max), color: '#f59e0b' },
                { label: 'Inscriptions totales', value: s.total_inscriptions, pct: this.pct(s.total_inscriptions, max), color: '#10b981' },
                { label: 'Cours complétés', value: s.total_completions, pct: this.pct(s.total_completions, s.total_inscriptions), color: '#059669' },
                { label: 'Quiz soumis', value: s.total_quizzes, pct: this.pct(s.total_quizzes, max), color: '#6366f1' },
            ];
        });
        ngOnInit() {
            this.loadAll();
        }
        loadAll() {
            this.loading.set(true);
            this.admin.latestStats().subscribe({
                next: (res) => {
                    this.snap.set(res.data?.snapshot ?? null);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
            this.admin.statsHistory(30).subscribe({
                next: (res) => this.history.set(res.data?.snapshots ?? [])
            });
        }
        refresh() {
            this.refreshing.set(true);
            this.admin.refreshStats().subscribe({
                next: () => {
                    this.snack.open('Statistiques recalculées', 'OK', { duration: 2000 });
                    this.refreshing.set(false);
                    this.loadAll();
                },
                error: () => {
                    this.snack.open('Erreur lors du recalcul', 'OK', { duration: 3000 });
                    this.refreshing.set(false);
                }
            });
        }
        barH(value, max) {
            return Math.max(4, Math.round((value / max) * 80));
        }
        pct(val, total) {
            if (!total)
                return 0;
            return Math.round((val / total) * 100);
        }
    };
    return AdminStatsComponent = _classThis;
})();
export { AdminStatsComponent };
