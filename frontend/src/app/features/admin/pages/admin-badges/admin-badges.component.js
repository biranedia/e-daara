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
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SocialService } from '@core/services/social.service';
let AdminBadgesComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-admin-badges',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [
                CommonModule, FormsModule,
                MatButtonModule, MatIconModule, MatFormFieldModule,
                MatInputModule, MatSelectModule, MatTabsModule, MatTooltipModule
            ],
            template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark flex items-center gap-2">
          <mat-icon class="text-amber-500">emoji_events</mat-icon>
          Badges & Gamification
        </h1>
        <p class="text-slate-500">Les badges sont attribués automatiquement selon la progression des apprenants.</p>
      </header>

      <mat-tab-group animationDuration="150ms">

        <!-- ═══ Onglet 1 : Définitions des badges ═══════════════════════════ -->
        <mat-tab label="Badges existants">
          <div class="pt-4 space-y-4">

            <!-- Formulaire création -->
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 class="font-semibold text-edaara-dark">Créer un badge</h3>

              <!-- Rangée 1 : Nom + XP -->
              <div class="grid sm:grid-cols-[1fr_160px] gap-3 items-start">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Nom du badge</mat-label>
                  <input matInput [(ngModel)]="newBadge.nom" placeholder="Ex: Premier pas" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Points XP</mat-label>
                  <input matInput type="number" [(ngModel)]="newBadge.xp_valeur" min="0" />
                  <mat-icon matSuffix class="text-amber-500">star</mat-icon>
                </mat-form-field>
              </div>

              <!-- Rangée 2 : Description -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>Description</mat-label>
                <input matInput [(ngModel)]="newBadge.description" placeholder="Ce badge récompense…" />
              </mat-form-field>

              <!-- Rangée 3 : Sélecteur d'icône -->
              <div>
                <p class="text-xs text-slate-500 mb-2 font-medium">Icône du badge</p>
                <div class="flex flex-wrap gap-2">
                  @for (e of emojiOptions; track e) {
                    <button type="button"
                            (click)="newBadge.icone = e"
                            class="w-10 h-10 rounded-lg text-2xl flex items-center justify-center border-2 transition-all"
                            [class.border-edaara-primary]="newBadge.icone === e"
                            [class.scale-110]="newBadge.icone === e"
                            [class.border-slate-200]="newBadge.icone !== e">
                      {{ e }}
                    </button>
                  }
                </div>
                @if (newBadge.icone) {
                  <p class="text-xs text-slate-400 mt-1.5">
                    Sélectionné : <span class="text-xl align-middle">{{ newBadge.icone }}</span>
                  </p>
                }
              </div>

              <!-- Rangée 4 : Critère automatique -->
              <div class="grid sm:grid-cols-2 gap-3 items-start">
                <!-- Type de critère -->
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Critère d'obtention automatique</mat-label>
                  <mat-select [(ngModel)]="criteriaType" (ngModelChange)="onCriteriaTypeChange()">
                    @for (c of criteriaTypes; track c.value) {
                      <mat-option [value]="c.value">{{ c.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <!-- Valeur seuil -->
                @if (criteriaType && criteriaType !== 'premiere_inscription') {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Seuil ({{ currentCriteriaUnit() }})</mat-label>
                    <input matInput type="number" [(ngModel)]="criteriaValeur" min="1" />
                  </mat-form-field>
                }
              </div>

              <!-- Aperçu du critère généré -->
              @if (criteriaType) {
                <div class="bg-slate-50 rounded-lg px-4 py-2 text-sm text-slate-600 flex items-center gap-2">
                  <mat-icon class="!text-base text-slate-400">info</mat-icon>
                  <span>Critère : <strong>{{ criteriaPreview() }}</strong></span>
                </div>
              }

              <div class="flex justify-end">
                <button mat-flat-button color="primary" (click)="createBadge()" [disabled]="!newBadge.nom?.trim()">
                  <mat-icon>add</mat-icon> Créer le badge
                </button>
              </div>
            </div>

            <!-- Grille des badges existants -->
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (b of badges(); track b.id) {
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                  <div class="flex gap-3 items-start">
                    <span class="text-4xl leading-none flex-shrink-0">{{ b.icone || '🏅' }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-edaara-dark truncate">{{ b.nom }}</p>
                      <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ b.description }}</p>
                      <div class="flex flex-wrap gap-1.5 mt-2">
                        @if (b.xp_valeur) {
                          <span class="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                            +{{ b.xp_valeur }} XP
                          </span>
                        }
                        @if (b.nb_attributions !== undefined) {
                          <span class="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            {{ b.nb_attributions }} apprenant(s)
                          </span>
                        }
                      </div>
                      @if (b.critere) {
                        <p class="text-xs text-slate-400 mt-1.5 italic">{{ parseCritereLabel(b.critere) }}</p>
                      }
                    </div>
                  </div>
                  <div class="flex justify-end mt-3 pt-3 border-t border-slate-50">
                    <button mat-icon-button color="warn" (click)="deleteBadge(b)"
                            matTooltip="Supprimer ce badge">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="col-span-3 text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-100">
                  <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">emoji_events</mat-icon>
                  <p class="mt-2">Aucun badge créé</p>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- ═══ Onglet 2 : Statistiques & Monitoring ═════════════════════════ -->
        <mat-tab label="Statistiques">
          <div class="pt-4 space-y-4">

            <!-- Top badges -->
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 class="font-semibold text-edaara-dark mb-3">🏆 Badges les plus attribués</h3>
              @if (stats()?.top_badges?.length) {
                <div class="space-y-2">
                  @for (b of stats()!.top_badges; track b.id; let i = $index) {
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <span class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {{ i + 1 }}
                      </span>
                      <span class="text-2xl">{{ b.icone || '🏅' }}</span>
                      <span class="flex-1 font-medium text-edaara-dark text-sm">{{ b.nom }}</span>
                      <span class="text-sm font-bold text-edaara-primary">{{ b.nb_attributions }}</span>
                      <span class="text-xs text-slate-400">apprenants</span>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-slate-400 text-sm text-center py-6">Aucune attribution automatique pour l'instant</p>
              }
            </div>

            <!-- Dernières attributions automatiques -->
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 class="font-semibold text-edaara-dark mb-3">✨ Dernières attributions automatiques</h3>
              @if (stats()?.recent_awards?.length) {
                <div class="space-y-2">
                  @for (a of stats()!.recent_awards; track a.obtenu_at) {
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <span class="text-xl">{{ a.icone || '🏅' }}</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-edaara-dark truncate">{{ a.badge_nom }}</p>
                        <p class="text-xs text-slate-500">{{ a.user_prenom }} {{ a.user_nom }} · {{ a.email }}</p>
                      </div>
                      <span class="text-xs text-slate-400 flex-shrink-0">
                        {{ a.obtenu_at | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-slate-400 text-sm text-center py-6">Aucune attribution récente</p>
              }
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminBadgesComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminBadgesComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        social = inject(SocialService);
        snack = inject(MatSnackBar);
        badges = signal([]);
        stats = signal(null);
        /** Emojis proposés comme icônes de badge */
        emojiOptions = [
            '🏆', '🥇', '🥈', '🥉', '🎖️', '🌟', '⭐', '💎', '🔥', '🚀',
            '🎓', '📚', '✅', '💡', '🎯', '🏅', '👑', '⚡', '🦁', '🦋'
        ];
        /** Types de critères automatiques supportés par badgeEngine */
        criteriaTypes = [
            { value: 'premiere_inscription', label: '🎓 Première inscription à un cours', unit: '', defaultVal: 1 },
            { value: 'cours_inscrits', label: '📚 Nombre de cours inscrits', unit: 'cours', defaultVal: 5 },
            { value: 'cours_completes', label: '✅ Nombre de cours terminés', unit: 'cours', defaultVal: 1 },
            { value: 'quiz_score_max', label: '🎯 Meilleur score à un quiz', unit: '%', defaultVal: 80 },
            { value: 'quiz_perfect', label: '💯 Quizzes réussis à 100%', unit: 'quiz', defaultVal: 1 },
            { value: 'xp_total', label: '⭐ Points XP accumulés', unit: 'XP', defaultVal: 100 }
        ];
        newBadge = {
            nom: '', icone: '', description: '', xp_valeur: 10
        };
        criteriaType = '';
        criteriaValeur = 1;
        ngOnInit() {
            this.loadBadges();
            this.loadStats();
        }
        loadBadges() {
            this.social.listAllBadges().subscribe({
                next: (res) => this.badges.set(res.data?.badges ?? [])
            });
        }
        loadStats() {
            this.social.badgeStats().subscribe({
                next: (res) => this.stats.set(res.data ?? null)
            });
        }
        onCriteriaTypeChange() {
            const ct = this.criteriaTypes.find(c => c.value === this.criteriaType);
            this.criteriaValeur = ct?.defaultVal ?? 1;
        }
        currentCriteriaUnit() {
            return this.criteriaTypes.find(c => c.value === this.criteriaType)?.unit ?? '';
        }
        criteriaPreview() {
            const ct = this.criteriaTypes.find(c => c.value === this.criteriaType);
            if (!ct)
                return '';
            if (this.criteriaType === 'premiere_inscription')
                return ct.label;
            return `${ct.label} ≥ ${this.criteriaValeur} ${ct.unit}`;
        }
        parseCritereLabel(critere) {
            try {
                const c = JSON.parse(critere);
                const ct = this.criteriaTypes.find(t => t.value === c.type);
                if (!ct)
                    return critere;
                if (c.type === 'premiere_inscription')
                    return `Auto : ${ct.label}`;
                return `Auto : ${ct.label} ≥ ${c.valeur} ${ct.unit}`;
            }
            catch {
                return critere;
            }
        }
        createBadge() {
            if (!this.newBadge.nom?.trim())
                return;
            const critere = this.criteriaType
                ? JSON.stringify({ type: this.criteriaType, valeur: this.criteriaValeur })
                : undefined;
            this.social.createBadge({ ...this.newBadge, critere }).subscribe({
                next: () => {
                    this.snack.open('Badge créé avec succès ✅', 'OK', { duration: 2500 });
                    this.newBadge = { nom: '', icone: '', description: '', xp_valeur: 10 };
                    this.criteriaType = '';
                    this.criteriaValeur = 1;
                    this.loadBadges();
                    this.loadStats();
                },
                error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
            });
        }
        deleteBadge(b) {
            if (!confirm(`Supprimer le badge "${b.nom}" ? Tous les utilisateurs qui l'ont obtenu le perdront.`))
                return;
            this.social.deleteBadge(b.id).subscribe({
                next: () => {
                    this.snack.open(`Badge "${b.nom}" supprimé`, 'OK', { duration: 2000 });
                    this.loadBadges();
                    this.loadStats();
                },
                error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
            });
        }
    };
    return AdminBadgesComponent = _classThis;
})();
export { AdminBadgesComponent };
