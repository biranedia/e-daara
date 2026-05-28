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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SocialService } from '@core/services/social.service';
let AdminCertificatesComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-admin-certificates',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [
                CommonModule, FormsModule,
                MatButtonModule, MatIconModule, MatFormFieldModule,
                MatInputModule, MatTabsModule, MatTooltipModule
            ],
            template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark flex items-center gap-2">
          <mat-icon class="text-edaara-primary">workspace_premium</mat-icon>
          Certificats
        </h1>
        <p class="text-slate-500">
          Les certificats sont générés automatiquement quand un apprenant termine un cours avec succès.
        </p>
      </header>

      <mat-tab-group animationDuration="150ms">

        <!-- ═══ Onglet 1 : Tous les certificats ═══════════════════════════ -->
        <mat-tab label="Certificats émis">
          <div class="pt-4 space-y-4">

            <!-- Compteurs -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                <p class="text-3xl font-bold text-edaara-primary">{{ certificates().length }}</p>
                <p class="text-xs text-slate-500 mt-1">Total émis</p>
              </div>
              <div class="bg-white rounded-xl p-4 shadow-sm border text-center"
                   [class]="mentionBg('Avec Félicitations')">
                <p class="text-3xl font-bold">{{ countMention('Avec Félicitations') }}</p>
                <p class="text-xs mt-1">🏆 Avec Félicitations</p>
              </div>
              <div class="bg-white rounded-xl p-4 shadow-sm border text-center"
                   [class]="mentionBg('Très Bien')">
                <p class="text-3xl font-bold">{{ countMention('Très Bien') }}</p>
                <p class="text-xs mt-1">⭐ Très Bien</p>
              </div>
              <div class="bg-white rounded-xl p-4 shadow-sm border text-center"
                   [class]="mentionBg('Bien')">
                <p class="text-3xl font-bold">{{ countMention('Bien') }}</p>
                <p class="text-xs mt-1">✅ Bien</p>
              </div>
            </div>

            <!-- Barre de recherche + refresh -->
            <div class="flex gap-2">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
                <mat-label>Rechercher (nom, email, numéro…)</mat-label>
                <mat-icon matPrefix>search</mat-icon>
                <input matInput [(ngModel)]="search" placeholder="Dupont, CER-…" />
              </mat-form-field>
              <button mat-stroked-button (click)="load()" class="!h-14">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>

            <!-- Tableau -->
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-semibold uppercase">Numéro de série</th>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-semibold uppercase">Apprenant</th>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-semibold uppercase">Cours</th>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-semibold uppercase">Mention</th>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-semibold uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of filtered(); track c.id) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3 font-mono text-xs text-edaara-primary font-bold">
                        {{ c.numero_serie }}
                      </td>
                      <td class="px-4 py-3">
                        <p class="font-medium text-edaara-dark">{{ c.user_prenom }} {{ c.user_nom }}</p>
                        <p class="text-xs text-slate-400">{{ c.email }}</p>
                      </td>
                      <td class="px-4 py-3 text-slate-600 text-xs">
                        {{ c.course_titre ?? c.path_titre ?? '—' }}
                      </td>
                      <td class="px-4 py-3">
                        @if (c.mention) {
                          <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                                [class]="mentionClass(c.mention)">
                            {{ mentionEmoji(c.mention) }} {{ c.mention }}
                          </span>
                        } @else {
                          <span class="text-slate-400 text-xs">—</span>
                        }
                      </td>
                      <td class="px-4 py-3 text-xs text-slate-500">
                        {{ (c.emis_at ?? c.date_emission) | date:'dd/MM/yyyy' }}
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-12 text-center text-slate-400">
                        @if (certificates().length === 0) {
                          <div>
                            <mat-icon class="!text-4xl text-slate-300">workspace_premium</mat-icon>
                            <p class="mt-2">Aucun certificat émis pour l'instant.</p>
                            <p class="text-xs mt-1">Les certificats apparaissent ici dès qu'un apprenant termine un cours.</p>
                          </div>
                        } @else {
                          Aucun résultat pour "{{ search }}"
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- ═══ Onglet 2 : Vérifier un certificat ════════════════════════ -->
        <mat-tab label="Vérifier l'authenticité">
          <div class="pt-4">
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 max-w-lg space-y-4">
              <h3 class="font-semibold text-edaara-dark">Vérifier un certificat</h3>
              <p class="text-sm text-slate-500">
                Entrez le numéro de série (format <span class="font-mono">CER-XXXXX-XXXXXX</span>)
                pour vérifier l'authenticité d'un certificat.
              </p>
              <div class="flex gap-2">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
                  <mat-label>Numéro de série</mat-label>
                  <mat-icon matPrefix>search</mat-icon>
                  <input matInput [(ngModel)]="verifyNum"
                         placeholder="CER-XXXXX-XXXXXX"
                         (keydown.enter)="verify()" />
                </mat-form-field>
                <button mat-flat-button color="primary" (click)="verify()"
                        [disabled]="!verifyNum.trim()" class="!h-14">
                  Vérifier
                </button>
              </div>

              @if (verified() === false) {
                <div class="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                  <mat-icon>cancel</mat-icon>
                  <div>
                    <p class="font-semibold">Certificat invalide</p>
                    <p class="text-sm">Ce numéro de série ne correspond à aucun certificat émis.</p>
                  </div>
                </div>
              }

              @if (verified() === true && cert()) {
                <div class="p-5 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-green-600">verified</mat-icon>
                    <p class="font-bold text-green-800">Certificat authentique ✓</p>
                  </div>
                  <div class="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                    <span class="text-slate-500">Numéro :</span>
                    <span class="font-mono font-bold text-green-800">{{ cert()!.numero_serie }}</span>
                    <span class="text-slate-500">Bénéficiaire :</span>
                    <span class="font-semibold">{{ cert()!.user_prenom }} {{ cert()!.user_nom }}</span>
                    @if (cert()!.course_titre) {
                      <span class="text-slate-500">Cours :</span>
                      <span>{{ cert()!.course_titre }}</span>
                    }
                    @if (cert()!.mention) {
                      <span class="text-slate-500">Mention :</span>
                      <span class="font-semibold" [class]="mentionTextColor(cert()!.mention!)">
                        {{ mentionEmoji(cert()!.mention!) }} {{ cert()!.mention }}
                      </span>
                    }
                    <span class="text-slate-500">Émis le :</span>
                    <span>{{ (cert()!.emis_at ?? cert()!.date_emission) | date:"dd MMMM yyyy" }}</span>
                  </div>
                </div>
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
    var AdminCertificatesComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminCertificatesComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        social = inject(SocialService);
        certificates = signal([]);
        cert = signal(null);
        verified = signal(null);
        search = '';
        verifyNum = '';
        ngOnInit() {
            this.load();
        }
        load() {
            this.social.listMyCertificates().subscribe({
                next: (res) => this.certificates.set(res.data?.certificates ?? [])
            });
        }
        filtered() {
            const q = this.search.trim().toLowerCase();
            if (!q)
                return this.certificates();
            return this.certificates().filter(c => (c.user_nom ?? '').toLowerCase().includes(q) ||
                (c.user_prenom ?? '').toLowerCase().includes(q) ||
                (c.email ?? '').toLowerCase().includes(q) ||
                c.numero_serie.toLowerCase().includes(q) ||
                (c.course_titre ?? '').toLowerCase().includes(q));
        }
        countMention(m) {
            return this.certificates().filter(c => c.mention === m).length;
        }
        verify() {
            if (!this.verifyNum.trim())
                return;
            this.verified.set(null);
            this.cert.set(null);
            this.social.verifyCertificate(this.verifyNum.trim()).subscribe({
                next: (res) => {
                    if (res.success && res.data?.certificate) {
                        this.cert.set(res.data.certificate);
                        this.verified.set(true);
                    }
                    else {
                        this.verified.set(false);
                    }
                },
                error: () => this.verified.set(false)
            });
        }
        mentionClass(m) {
            const map = {
                'Avec Félicitations': 'bg-purple-100 text-purple-700',
                'Très Bien': 'bg-blue-100 text-blue-700',
                'Bien': 'bg-green-100 text-green-700',
                'Passable': 'bg-amber-100 text-amber-700'
            };
            return map[m ?? ''] ?? 'bg-slate-100 text-slate-600';
        }
        mentionTextColor(m) {
            const map = {
                'Avec Félicitations': 'text-purple-700',
                'Très Bien': 'text-blue-700',
                'Bien': 'text-green-700',
                'Passable': 'text-amber-600'
            };
            return map[m] ?? '';
        }
        mentionBg(m) {
            const map = {
                'Avec Félicitations': 'border-purple-200 bg-purple-50 text-purple-700',
                'Très Bien': 'border-blue-200 bg-blue-50 text-blue-700',
                'Bien': 'border-green-200 bg-green-50 text-green-700',
                'Passable': 'border-amber-200 bg-amber-50 text-amber-700'
            };
            return map[m] ?? '';
        }
        mentionEmoji(m) {
            const map = {
                'Avec Félicitations': '🏆',
                'Très Bien': '⭐',
                'Bien': '✅',
                'Passable': '📋'
            };
            return map[m] ?? '';
        }
    };
    return AdminCertificatesComponent = _classThis;
})();
export { AdminCertificatesComponent };
