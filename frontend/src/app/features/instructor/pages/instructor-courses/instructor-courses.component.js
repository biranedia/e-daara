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
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '@core/services/course.service';
let InstructorCoursesComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-instructor-courses',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatMenuModule],
            template: `
    <div class="space-y-4">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Mes cours</h1>
          <p class="text-slate-500 text-sm">{{ courses().length }} cours au total</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/instructor/courses/new">
          <mat-icon>add</mat-icon> Nouveau cours
        </a>
      </header>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (c of courses(); track c.id) {
          <article class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div class="h-28 bg-gradient-to-br from-edaara-primary to-teal-700 flex items-center justify-center relative">
              <mat-icon class="!w-12 !h-12 !text-5xl text-white/80">menu_book</mat-icon>
              <!-- Badge statut -->
              <span class="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="statusClass(c.status)">
                {{ statusLabel(c.status) }}
              </span>
            </div>

            <div class="p-4 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-bold text-edaara-dark line-clamp-2 flex-1">{{ c.titre }}</h3>
                <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['/instructor/courses', c.id]">
                    <mat-icon>edit</mat-icon> Modifier
                  </a>
                  <a mat-menu-item [routerLink]="['/instructor/courses', c.id, 'sections']">
                    <mat-icon>list</mat-icon> Sections & leçons
                  </a>
                  <button mat-menu-item (click)="remove(c)" class="!text-red-600"
                          [disabled]="c.status === 'published'">
                    <mat-icon class="!text-red-600">delete</mat-icon> Supprimer
                  </button>
                </mat-menu>
              </div>

              <p class="text-sm text-slate-500 line-clamp-2 mt-1 flex-1">
                {{ c.description || 'Pas de description' }}
              </p>

              <div class="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>{{ c.nb_inscrits || 0 }} inscrits</span>
                  @if (c.niveau) {
                    <span class="capitalize">{{ c.niveau }}</span>
                  }
                </div>

                <!-- Bouton soumettre uniquement pour les brouillons -->
                @if (c.status === 'draft') {
                  <button
                    mat-flat-button
                    color="primary"
                    class="w-full !text-sm"
                    [disabled]="submitting() === c.id"
                    (click)="submit(c)">
                    <mat-icon>send</mat-icon>
                    {{ submitting() === c.id ? 'Envoi…' : 'Soumettre pour validation' }}
                  </button>
                }

                @if (c.status === 'pending') {
                  <div class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    <mat-icon class="!text-sm">hourglass_empty</mat-icon>
                    En attente de validation par l'admin
                  </div>
                }

                @if (c.status === 'published') {
                  <div class="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <mat-icon class="!text-sm">check_circle</mat-icon>
                    Publié et accessible aux apprenants
                  </div>
                }
              </div>
            </div>
          </article>
        } @empty {
          <div class="col-span-full bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
            <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">menu_book</mat-icon>
            <p class="text-slate-600 mt-3 font-medium">Vous n'avez encore créé aucun cours.</p>
            <p class="text-slate-400 text-sm mt-1">Commencez par créer votre premier cours.</p>
            <a mat-flat-button color="primary" routerLink="/instructor/courses/new" class="mt-4">
              <mat-icon>add</mat-icon> Créer mon premier cours
            </a>
          </div>
        }
      </div>
    </div>
  `
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var InstructorCoursesComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            InstructorCoursesComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        courseService = inject(CourseService);
        snack = inject(MatSnackBar);
        courses = signal([]);
        submitting = signal(null);
        ngOnInit() {
            this.load();
        }
        load() {
            this.courseService.listMine().subscribe({
                next: (res) => this.courses.set(res.data?.courses ?? [])
            });
        }
        submit(c) {
            this.submitting.set(c.id);
            this.courseService.submit(c.id).subscribe({
                next: (res) => {
                    this.submitting.set(null);
                    if (res.decision === 'approved') {
                        this.snack.open(`✅ "${c.titre}" validé automatiquement — il est maintenant publié !`, 'OK', { duration: 5000 });
                    }
                    else if (res.decision === 'rejected') {
                        const raisons = res.failed_criteria?.length
                            ? ` Critères manquants : ${res.failed_criteria.join(', ')}`
                            : '';
                        this.snack.open(`❌ "${c.titre}" refusé automatiquement.${raisons}`, 'Fermer', { duration: 8000 });
                    }
                    else {
                        this.snack.open(res.message ?? `"${c.titre}" soumis`, 'OK', { duration: 3000 });
                    }
                    this.load();
                },
                error: (err) => {
                    this.submitting.set(null);
                    this.snack.open(err?.error?.message ?? 'Erreur lors de la soumission', 'OK', { duration: 3000 });
                }
            });
        }
        remove(c) {
            if (!confirm(`Supprimer définitivement "${c.titre}" ?`))
                return;
            this.courseService.delete(c.id).subscribe({
                next: () => {
                    this.snack.open('Cours supprimé', 'OK', { duration: 2000 });
                    this.load();
                }
            });
        }
        statusClass(s) {
            return {
                published: 'bg-green-100 text-green-700',
                pending: 'bg-amber-100 text-amber-700',
                draft: 'bg-slate-100 text-slate-600',
                rejected: 'bg-red-100 text-red-600'
            }[s ?? ''] ?? 'bg-slate-100 text-slate-600';
        }
        statusLabel(s) {
            return {
                published: 'Publié',
                pending: 'En attente',
                draft: 'Brouillon',
                rejected: 'Refusé'
            }[s ?? ''] ?? s ?? '';
        }
    };
    return InstructorCoursesComponent = _classThis;
})();
export { InstructorCoursesComponent };
