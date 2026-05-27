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
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { AdminService } from '@core/services/admin.service';
let ProfileComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-profile',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [
                CommonModule, ReactiveFormsModule,
                MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
                MatTabsModule, MatIconModule
            ],
            template: `
    <div class="max-w-2xl mx-auto px-6 py-8 space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Mon profil</h1>
        <p class="text-slate-500">Gérez vos informations personnelles</p>
      </header>

      <mat-tab-group>
        <mat-tab label="Profil">
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-3 pt-4">
            <div class="grid sm:grid-cols-2 gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="prenom" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Bio</mat-label>
              <textarea matInput formControlName="bio" rows="3"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Avatar (URL)</mat-label>
              <input matInput formControlName="avatar" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Langue préférée</mat-label>
              <mat-select formControlName="langue_pref">
                <mat-option value="fr">Français</mat-option>
                <mat-option value="en">Anglais</mat-option>
                <mat-option value="wo">Wolof</mat-option>
              </mat-select>
            </mat-form-field>
            <div class="flex justify-end">
              <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid">
                <mat-icon>save</mat-icon> Enregistrer
              </button>
            </div>
          </form>
        </mat-tab>

        <mat-tab label="Mot de passe">
          <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="space-y-3 pt-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Mot de passe actuel</mat-label>
              <input matInput type="password" formControlName="currentPassword" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nouveau mot de passe</mat-label>
              <input matInput type="password" formControlName="newPassword" />
            </mat-form-field>
            <div class="flex justify-end">
              <button mat-flat-button color="primary" type="submit" [disabled]="passwordForm.invalid">
                <mat-icon>lock</mat-icon> Changer le mot de passe
              </button>
            </div>
          </form>
        </mat-tab>

        <mat-tab label="Mes données (RGPD)">
          <div class="space-y-3 pt-4">
            <p class="text-slate-600 text-sm">
              Conformément à la loi sénégalaise n°2008-12, vous pouvez à tout moment :
            </p>
            <div class="grid sm:grid-cols-2 gap-3">
              <button mat-stroked-button (click)="requestGdpr('portability')">
                <mat-icon>download</mat-icon> Portabilité de mes données
              </button>
              <button mat-stroked-button (click)="requestGdpr('access')">
                <mat-icon>visibility</mat-icon> Accéder à mes données
              </button>
              <button mat-stroked-button (click)="requestGdpr('rectify')">
                <mat-icon>edit</mat-icon> Demander une rectification
              </button>
              <button mat-stroked-button color="warn" (click)="requestGdpr('delete')">
                <mat-icon>delete_forever</mat-icon> Supprimer mon compte
              </button>
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
    var ProfileComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProfileComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        fb = inject(FormBuilder);
        auth = inject(AuthService);
        admin = inject(AdminService);
        snack = inject(MatSnackBar);
        profileForm = this.fb.nonNullable.group({
            nom: [''],
            prenom: [''],
            bio: [''],
            avatar: [''],
            langue_pref: ['fr']
        });
        passwordForm = this.fb.nonNullable.group({
            currentPassword: ['', [Validators.required, Validators.minLength(8)]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]]
        });
        ngOnInit() {
            this.auth.loadProfile().subscribe({
                next: (res) => {
                    if (res.data?.user) {
                        const u = res.data.user;
                        this.profileForm.patchValue({
                            nom: u.nom ?? '',
                            prenom: u.prenom ?? '',
                            bio: u.bio ?? '',
                            avatar: u.avatar ?? '',
                            langue_pref: u.langue_pref ?? 'fr'
                        });
                    }
                }
            });
        }
        saveProfile() {
            this.auth.updateProfile(this.profileForm.getRawValue()).subscribe({
                next: () => this.snack.open('Profil mis à jour', 'OK', { duration: 2000 }),
                error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
            });
        }
        savePassword() {
            const { currentPassword, newPassword } = this.passwordForm.getRawValue();
            this.auth.changePassword(currentPassword, newPassword).subscribe({
                next: () => {
                    this.snack.open('Mot de passe modifié', 'OK', { duration: 2000 });
                    this.passwordForm.reset();
                },
                error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
            });
        }
        requestGdpr(type) {
            const motif = prompt('Motif de la demande (facultatif) :') ?? undefined;
            this.admin.createGdprRequest(type, motif).subscribe({
                next: () => this.snack.open("Demande envoyée, l'admin vous répondra", 'OK', { duration: 3000 }),
                error: () => this.snack.open('Erreur', 'OK', { duration: 3000 })
            });
        }
    };
    return ProfileComponent = _classThis;
})();
export { ProfileComponent };
