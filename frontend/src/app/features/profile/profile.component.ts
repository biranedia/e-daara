import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { AdminService } from '@core/services/admin.service';
import { GdprConfirmDialogComponent } from './gdpr-confirm-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTabsModule, MatIconModule, MatProgressSpinnerModule,
    GdprConfirmDialogComponent
  ],
  template: `
    <div class="max-w-2xl mx-auto px-6 py-8 space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Mon profil</h1>
        <p class="text-slate-500">Gérez vos informations personnelles</p>
      </header>

      <mat-tab-group>

        <!-- ══════════════ ONGLET PROFIL ══════════════ -->
        <mat-tab label="Profil">
          <div class="space-y-5 pt-5">

            <!-- ──── Widget avatar ──── -->
            <div class="flex flex-col items-center gap-3">

              <!-- Cercle cliquable -->
              <div class="relative w-24 h-24 rounded-full cursor-pointer group"
                   (click)="fileInput.click()">

                @if (previewUrl()) {
                  <img [src]="previewUrl()!"
                       alt="Photo de profil"
                       class="w-24 h-24 rounded-full object-cover border-2 border-edaara-primary/30" />
                } @else {
                  <div class="w-24 h-24 rounded-full bg-edaara-primary/10 border-2 border-edaara-primary/30
                              flex items-center justify-center text-2xl font-bold text-edaara-primary select-none">
                    {{ initials() }}
                  </div>
                }

                <!-- Overlay caméra -->
                <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
                            transition-opacity flex items-center justify-center">
                  @if (uploading()) {
                    <mat-spinner diameter="28" class="[&_circle]:stroke-white"></mat-spinner>
                  } @else {
                    <mat-icon class="!text-white !text-3xl">photo_camera</mat-icon>
                  }
                </div>
              </div>

              <p class="text-xs text-slate-400 text-center">
                Cliquer pour choisir une photo · JPEG, PNG, WEBP · max 2 Mo
              </p>

              <!-- Input file (unique, caché) -->
              <input #fileInput
                     type="file"
                     accept="image/jpeg,image/png,image/webp,image/gif"
                     class="hidden"
                     (change)="onFileSelected($event)" />

              @if (uploadError()) {
                <p class="text-xs text-red-600 flex items-center gap-1">
                  <mat-icon class="!text-sm">error_outline</mat-icon>
                  {{ uploadError() }}
                </p>
              }
            </div>

            <!-- ──── Formulaire infos ──── -->
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-3">
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
          </div>
        </mat-tab>

        <!-- ══════════════ ONGLET MOT DE PASSE ══════════════ -->
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

        <!-- ══════════════ ONGLET RGPD ══════════════ -->
        <mat-tab label="Mes données (RGPD)">
          <div class="space-y-3 pt-4">
            <p class="text-slate-600 text-sm">
              Conformément à la loi sénégalaise n°2008-12, vous pouvez à tout moment demander la suppression de votre compte.
            </p>
            <button mat-stroked-button color="warn" (click)="requestGdpr('delete')">
              <mat-icon>delete_forever</mat-icon> Supprimer mon compte
            </button>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private readonly fb    = inject(FormBuilder);
  protected readonly auth  = inject(AuthService);
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // ─── Upload état ──────────────────────────────────────────────────────────
  protected readonly previewUrl  = signal<string | null>(null);
  protected readonly uploading   = signal(false);
  protected readonly uploadError = signal<string | null>(null);

  /** Initiales affichées quand aucune photo n'est définie */
  protected readonly initials = computed(() => {
    const u = this.auth.currentUser();
    return ((u?.prenom?.[0] ?? '') + (u?.nom?.[0] ?? '')).toUpperCase() || '?';
  });

  // ─── Formulaires ──────────────────────────────────────────────────────────
  protected readonly profileForm = this.fb.nonNullable.group({
    nom:         [''],
    prenom:      [''],
    bio:         [''],
    langue_pref: ['fr']
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]]
  });

  // ─── Init ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.auth.loadProfile().subscribe({
      next: (res) => {
        if (res.data?.user) {
          const u = res.data.user;
          this.profileForm.patchValue({
            nom:         u.nom         ?? '',
            prenom:      u.prenom      ?? '',
            bio:         u.bio         ?? '',
            langue_pref: u.langue_pref ?? 'fr'
          });
          if (u.avatar) this.previewUrl.set(u.avatar);
        }
      }
    });
  }

  // ─── Sélection fichier → preview → upload immédiat ────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    this.uploadError.set(null);

    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError.set('Format non supporté. Utilisez JPEG, PNG, WEBP ou GIF.');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.uploadError.set('Fichier trop volumineux (max 2 Mo).');
      input.value = '';
      return;
    }

    // Preview immédiat (Base64 local)
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload vers le serveur
    this.uploading.set(true);
    this.auth.uploadAvatar(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.data?.avatarUrl) this.previewUrl.set(res.data.avatarUrl);
        this.snack.open('Photo de profil mise à jour ✓', 'OK', { duration: 2500 });
        input.value = '';
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(err?.error?.message ?? "Erreur lors de l'upload");
        // Remettre l'ancienne photo si erreur
        const saved = this.auth.currentUser()?.avatar ?? null;
        this.previewUrl.set(saved);
        input.value = '';
      }
    });
  }

  // ─── Sauvegarde infos profil ───────────────────────────────────────────────
  saveProfile(): void {
    this.auth.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => this.snack.open('Profil mis à jour', 'OK', { duration: 2000 }),
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  // ─── Changement de mot de passe ───────────────────────────────────────────
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

  // ─── Demandes RGPD ────────────────────────────────────────────────────────
  requestGdpr(type: 'access' | 'delete' | 'rectify' | 'portability'): void {
    this.dialog.open(GdprConfirmDialogComponent, { width: '440px' })
      .afterClosed()
      .subscribe((motif: string | undefined) => {
        if (motif === undefined) return; // l'utilisateur a annulé
        this.admin.createGdprRequest(type, motif || undefined).subscribe({
          next: () => this.snack.open("Demande envoyée, l'admin vous répondra", 'OK', { duration: 3000 }),
          error: () => this.snack.open('Erreur', 'OK', { duration: 3000 })
        });
      });
  }
}
