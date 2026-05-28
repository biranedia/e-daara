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
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '@core/services/admin.service';
import { AuthService } from '@core/services/auth.service';
let AdminUsersComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-admin-users',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [
                CommonModule, FormsModule, ReactiveFormsModule,
                MatTableModule, MatButtonModule, MatIconModule,
                MatMenuModule, MatFormFieldModule, MatInputModule,
                MatSelectModule, MatProgressSpinnerModule
            ],
            template: `
    <div class="space-y-4">

      <!-- En-tête -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Gestion des utilisateurs</h1>
          <p class="text-slate-500 text-sm">{{ filtered().length }} utilisateur(s) · {{ users().length }} au total</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Recherche -->
          <div class="relative">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-lg pointer-events-none">search</mat-icon>
            <input
              type="text"
              [(ngModel)]="search"
              placeholder="Rechercher par email, nom..."
              class="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-edaara-primary w-56 transition-colors"
            />
          </div>
          <!-- Bouton Créer -->
          <button mat-flat-button color="primary" (click)="openCreate()"
                  class="flex items-center gap-1 !rounded-lg">
            <mat-icon>person_add</mat-icon>
            Créer un utilisateur
          </button>
        </div>
      </header>

      <!-- Tableau -->
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
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="roleClass(role)">{{ role }}</span>
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
              <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="statusClass(u.status)">
                {{ statusLabel(u.status) }}
              </span>
            </td>
          </ng-container>

          <!-- Inscrit le -->
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef class="text-xs text-slate-500 uppercase tracking-wider font-medium">Inscrit le</th>
            <td mat-cell *matCellDef="let u" class="text-sm text-slate-600">{{ u.created_at | date:'dd/MM/yyyy' }}</td>
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

                <!-- Modifier -->
                <button mat-menu-item (click)="openEdit(u)">
                  <mat-icon class="text-edaara-primary">edit</mat-icon> Modifier
                </button>

                <!-- Statut -->
                <div class="border-t border-slate-100 mt-1 pt-1">
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
                </div>

                <!-- Rôles -->
                <div class="border-t border-slate-100 mt-1 pt-1">
                  <p class="px-4 py-1 text-xs text-slate-400 uppercase tracking-wider font-medium">Rôles</p>
                  <button mat-menu-item (click)="toggleRole(u, 'instructor')">
                    <mat-icon [class]="hasRole(u, 'instructor') ? 'text-edaara-primary' : 'text-slate-400'">
                      {{ hasRole(u, 'instructor') ? 'school' : 'person_add' }}
                    </mat-icon>
                    {{ hasRole(u, 'instructor') ? 'Retirer formateur' : 'Nommer formateur' }}
                  </button>
                  <button mat-menu-item (click)="toggleRole(u, 'admin')" [disabled]="u.id === auth.currentUser()?.id">
                    <mat-icon [class]="hasRole(u, 'admin') ? 'text-purple-600' : 'text-slate-400'">
                      {{ hasRole(u, 'admin') ? 'admin_panel_settings' : 'person_add' }}
                    </mat-icon>
                    {{ hasRole(u, 'admin') ? 'Retirer admin' : 'Nommer admin' }}
                  </button>
                </div>

                <!-- Supprimer -->
                <div class="border-t border-slate-100 mt-1 pt-1">
                  <button mat-menu-item (click)="confirmDeleteUser(u)"
                          [disabled]="u.id === auth.currentUser()?.id"
                          class="!text-red-600">
                    <mat-icon class="text-red-600">delete_forever</mat-icon> Supprimer
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
          <div class="flex justify-center py-12">
            <mat-spinner diameter="36"></mat-spinner>
          </div>
        }
      </div>
    </div>

    <!-- ============================================================
         OVERLAY — Panneau Create / Edit
    ============================================================ -->
    @if (formMode() !== null) {
      <!-- Fond sombre -->
      <div class="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" (click)="closeForm()"></div>

      <!-- Panneau latéral -->
      <aside class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">

        <!-- Titre panneau -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-edaara-dark">
            {{ formMode() === 'create' ? 'Créer un utilisateur' : 'Modifier ' + (editingUser()?.prenom ?? '') + ' ' + (editingUser()?.nom ?? '') }}
          </h2>
          <button mat-icon-button (click)="closeForm()" aria-label="Fermer">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Formulaire -->
        <form [formGroup]="userForm" (ngSubmit)="submitForm()" class="flex-1 px-6 py-5 space-y-4">

          <div class="grid grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="prenom" placeholder="Birane" />
              @if (userForm.get('prenom')?.invalid && userForm.get('prenom')?.touched) {
                <mat-error>Prénom requis (min. 2 caractères)</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom" placeholder="Diao" />
              @if (userForm.get('nom')?.invalid && userForm.get('nom')?.touched) {
                <mat-error>Nom requis (min. 2 caractères)</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="birane@edaara.sn" />
            @if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
              <mat-error>Email valide requis</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ formMode() === 'create' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour ne pas changer)' }}</mat-label>
            <input matInput formControlName="password" type="password" />
            @if (userForm.get('password')?.invalid && userForm.get('password')?.touched) {
              <mat-error>Minimum 8 caractères</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Rôles</mat-label>
            <mat-select formControlName="roles" multiple>
              <mat-option value="student">Apprenant</mat-option>
              <mat-option value="instructor">Formateur</mat-option>
              <mat-option value="admin">Administrateur</mat-option>
            </mat-select>
            @if (userForm.get('roles')?.invalid && userForm.get('roles')?.touched) {
              <mat-error>Au moins un rôle requis</mat-error>
            }
          </mat-form-field>

          @if (formError()) {
            <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {{ formError() }}
            </div>
          }

          <div class="flex gap-3 pt-2">
            <button mat-flat-button color="primary" type="submit"
                    [disabled]="formSaving()"
                    class="flex-1 !rounded-lg">
              @if (formSaving()) {
                <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner>
              }
              {{ formMode() === 'create' ? 'Créer' : 'Enregistrer' }}
            </button>
            <button mat-stroked-button type="button" (click)="closeForm()" class="!rounded-lg">
              Annuler
            </button>
          </div>
        </form>
      </aside>
    }

    <!-- ============================================================
         OVERLAY — Confirmation de suppression
    ============================================================ -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm flex items-center justify-center p-4"
           (click)="cancelDelete()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
             (click)="$event.stopPropagation()">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-red-600">warning</mat-icon>
            </div>
            <div>
              <h3 class="font-semibold text-slate-800">Confirmer la suppression</h3>
              <p class="text-sm text-slate-500 mt-1">
                Voulez-vous vraiment supprimer le compte de
                <strong>{{ deleteTarget()!.prenom }} {{ deleteTarget()!.nom }}</strong>
                ({{ deleteTarget()!.email }}) ?
                <br/>Cette action est irréversible.
              </p>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button mat-stroked-button (click)="cancelDelete()" class="!rounded-lg">Annuler</button>
            <button mat-flat-button color="warn" (click)="executeDelete()"
                    [disabled]="formSaving()" class="!rounded-lg">
              @if (formSaving()) { <mat-spinner diameter="16" class="inline-block mr-1"></mat-spinner> }
              Supprimer
            </button>
          </div>
        </div>
      </div>
    }
  `
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminUsersComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminUsersComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        adminSvc = inject(AdminService);
        snack = inject(MatSnackBar);
        fb = inject(FormBuilder);
        auth = inject(AuthService);
        cols = ['user', 'roles', 'status', 'created', 'last_login', 'actions'];
        users = signal([]);
        loading = signal(true);
        search = '';
        // État du panneau Create / Edit
        formMode = signal(null);
        editingUser = signal(null);
        formSaving = signal(false);
        formError = signal(null);
        // Confirmation de suppression
        deleteTarget = signal(null);
        filtered = computed(() => {
            const q = this.search.trim().toLowerCase();
            const list = this.users();
            if (!q)
                return list;
            return list.filter(u => [u.email, u.nom, u.prenom].some(v => (v ?? '').toLowerCase().includes(q)));
        });
        // Formulaire réactif
        userForm = this.fb.group({
            prenom: ['', [Validators.required, Validators.minLength(2)]],
            nom: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', []], // requis uniquement en mode create
            roles: [['student'], [Validators.required, Validators.minLength(1)]]
        });
        ngOnInit() {
            this.load();
        }
        load() {
            this.loading.set(true);
            this.adminSvc.listUsers().subscribe({
                next: res => { this.users.set(res.data?.users ?? []); this.loading.set(false); },
                error: () => this.loading.set(false)
            });
        }
        // ─── Panneau Create ───────────────────────────────────────────────
        openCreate() {
            this.editingUser.set(null);
            this.formError.set(null);
            this.userForm.reset({ prenom: '', nom: '', email: '', password: '', roles: ['student'] });
            // Mot de passe obligatoire en création
            this.userForm.get('password').setValidators([Validators.required, Validators.minLength(8)]);
            this.userForm.get('password').updateValueAndValidity();
            this.formMode.set('create');
        }
        // ─── Panneau Edit ─────────────────────────────────────────────────
        openEdit(u) {
            this.editingUser.set(u);
            this.formError.set(null);
            this.userForm.reset({
                prenom: u.prenom,
                nom: u.nom,
                email: u.email,
                password: '',
                roles: u.roles ?? ['student']
            });
            // Mot de passe facultatif en édition
            this.userForm.get('password').setValidators([Validators.minLength(8)]);
            this.userForm.get('password').updateValueAndValidity();
            this.formMode.set('edit');
        }
        closeForm() {
            this.formMode.set(null);
            this.editingUser.set(null);
            this.formError.set(null);
        }
        // ─── Soumission du formulaire ──────────────────────────────────────
        submitForm() {
            if (this.userForm.invalid || this.formSaving()) {
                this.userForm.markAllAsTouched();
                return;
            }
            this.formSaving.set(true);
            this.formError.set(null);
            const { prenom, nom, email, password, roles } = this.userForm.getRawValue();
            if (this.formMode() === 'create') {
                this.adminSvc.createUser({ nom: nom, prenom: prenom, email: email, password: password, roles: roles }).subscribe({
                    next: () => {
                        this.snack.open(`Utilisateur ${prenom} ${nom} créé avec succès`, 'OK', { duration: 3000 });
                        this.formSaving.set(false);
                        this.closeForm();
                        this.load();
                    },
                    error: err => {
                        this.formSaving.set(false);
                        this.formError.set(err?.error?.message ?? 'Erreur lors de la création');
                    }
                });
            }
            else {
                const u = this.editingUser();
                const payload = {};
                if (nom && nom !== u.nom)
                    payload['nom'] = nom;
                if (prenom && prenom !== u.prenom)
                    payload['prenom'] = prenom;
                if (email && email !== u.email)
                    payload['email'] = email;
                if (password)
                    payload['password'] = password;
                // Mettre à jour les rôles si modifiés
                const rolesChanged = JSON.stringify([...(roles ?? [])].sort()) !== JSON.stringify([...(u.roles ?? [])].sort());
                const calls = [];
                if (Object.keys(payload).length) {
                    calls.push(() => this.adminSvc.updateUser(u.id, payload).subscribe({
                        next: () => this.afterSave(prenom, nom, rolesChanged, roles, u),
                        error: err => { this.formSaving.set(false); this.formError.set(err?.error?.message ?? 'Erreur de mise à jour'); }
                    }));
                }
                else if (rolesChanged) {
                    calls.push(() => this.updateRolesOnly(roles, u, prenom, nom));
                }
                else {
                    this.snack.open('Aucun changement détecté', 'OK', { duration: 2000 });
                    this.formSaving.set(false);
                    this.closeForm();
                    return;
                }
                calls[0]();
            }
        }
        afterSave(prenom, nom, rolesChanged, roles, u) {
            if (rolesChanged) {
                this.adminSvc.assignRoles(u.id, roles).subscribe({
                    next: () => this.onSaveSuccess(prenom, nom),
                    error: () => this.onSaveSuccess(prenom, nom) // infos sauvées, rôles non — on informe quand même
                });
            }
            else {
                this.onSaveSuccess(prenom, nom);
            }
        }
        updateRolesOnly(roles, u, prenom, nom) {
            this.adminSvc.assignRoles(u.id, roles).subscribe({
                next: () => this.onSaveSuccess(prenom, nom),
                error: err => { this.formSaving.set(false); this.formError.set(err?.error?.message ?? 'Erreur de mise à jour des rôles'); }
            });
        }
        onSaveSuccess(prenom, nom) {
            this.snack.open(`${prenom} ${nom} mis à jour avec succès`, 'OK', { duration: 3000 });
            this.formSaving.set(false);
            this.closeForm();
            this.load();
        }
        // ─── Suppression ──────────────────────────────────────────────────
        confirmDeleteUser(u) {
            this.deleteTarget.set(u);
        }
        cancelDelete() {
            this.deleteTarget.set(null);
        }
        executeDelete() {
            const u = this.deleteTarget();
            if (!u)
                return;
            this.formSaving.set(true);
            this.adminSvc.deleteUser(u.id).subscribe({
                next: () => {
                    this.snack.open(`Utilisateur ${u.prenom} ${u.nom} supprimé`, 'OK', { duration: 3000 });
                    this.formSaving.set(false);
                    this.deleteTarget.set(null);
                    this.load();
                },
                error: err => {
                    this.formSaving.set(false);
                    this.snack.open(err?.error?.message ?? 'Erreur lors de la suppression', 'OK', { duration: 3000 });
                }
            });
        }
        // ─── Actions existantes ───────────────────────────────────────────
        setStatus(u, status) {
            this.adminSvc.updateUserStatus(u.id, status).subscribe({
                next: () => {
                    this.snack.open(`Statut mis à jour : ${this.statusLabel(status)}`, 'OK', { duration: 2500 });
                    this.load();
                },
                error: () => this.snack.open('Erreur lors de la mise à jour', 'OK', { duration: 3000 })
            });
        }
        hasRole(u, role) {
            return (u.roles ?? []).includes(role);
        }
        toggleRole(u, role) {
            const current = u.roles ?? [];
            const newRoles = current.includes(role)
                ? current.filter(r => r !== role)
                : [...current, role];
            this.adminSvc.assignRoles(u.id, newRoles).subscribe({
                next: () => {
                    const verb = current.includes(role) ? 'retiré' : 'ajouté';
                    this.snack.open(`Rôle "${role}" ${verb} pour ${u.prenom} ${u.nom}`, 'OK', { duration: 3000 });
                    this.load();
                },
                error: () => this.snack.open('Erreur lors de la mise à jour des rôles', 'OK', { duration: 3000 })
            });
        }
        // ─── Helpers CSS ──────────────────────────────────────────────────
        statusClass(s) {
            return {
                active: 'bg-green-100 text-green-700',
                inactive: 'bg-slate-100 text-slate-700',
                suspended: 'bg-red-100 text-red-700',
                pending: 'bg-amber-100 text-amber-700'
            }[s] ?? 'bg-slate-100 text-slate-700';
        }
        statusLabel(s) {
            return { active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu', pending: 'En attente' }[s] ?? s;
        }
        roleClass(role) {
            return {
                admin: 'bg-purple-100 text-purple-700',
                instructor: 'bg-blue-100 text-blue-700',
                student: 'bg-teal-100 text-teal-700'
            }[role] ?? 'bg-slate-100 text-slate-600';
        }
    };
    return AdminUsersComponent = _classThis;
})();
export { AdminUsersComponent };
