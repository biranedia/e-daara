import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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

@Component({
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
              <button mat-stroked-button (click)="requestGdpr('export')">
                <mat-icon>download</mat-icon> Exporter mes données
              </button>
              <button mat-stroked-button (click)="requestGdpr('rectify')">
                <mat-icon>edit</mat-icon> Demander une rectification
              </button>
              <button mat-stroked-button color="warn" (click)="requestGdpr('delete')">
                <mat-icon>delete_forever</mat-icon> Supprimer mon compte
              </button>
              <button mat-stroked-button color="warn" (click)="requestGdpr('oblivion')">
                <mat-icon>history_toggle_off</mat-icon> Droit à l'oubli
              </button>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);

  protected readonly profileForm = this.fb.nonNullable.group({
    nom: [''],
    prenom: [''],
    bio: [''],
    avatar: [''],
    langue_pref: ['fr']
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
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

  saveProfile(): void {
    this.auth.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => this.snack.open('Profil mis à jour', 'OK', { duration: 2000 }),
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  savePassword(): void {
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.snack.open('Mot de passe modifié', 'OK', { duration: 2000 });
        this.passwordForm.reset();
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  requestGdpr(type: 'export' | 'delete' | 'rectify' | 'oblivion'): void {
    const motif = prompt('Motif de la demande (facultatif) :') ?? undefined;
    this.admin.createGdprRequest(type, motif).subscribe({
      next: () => this.snack.open("Demande envoyée, l'admin vous répondra", 'OK', { duration: 3000 }),
      error: () => this.snack.open('Erreur', 'OK', { duration: 3000 })
    });
  }
}
