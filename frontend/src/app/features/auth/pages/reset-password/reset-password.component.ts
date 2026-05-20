import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-edaara-light to-slate-200 p-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 class="text-2xl font-bold text-edaara-dark text-center mb-6">Nouveau mot de passe</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Nouveau mot de passe</mat-label>
            <input matInput type="password" formControlName="newPassword" />
          </mat-form-field>

          @if (errorMsg()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {{ errorMsg() }}
            </div>
          }
          @if (done()) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
              Mot de passe réinitialisé. Vous pouvez vous connecter.
            </div>
          }

          <button mat-flat-button color="primary" type="submit"
                  [disabled]="form.invalid || loading()" class="!h-12">
            Réinitialiser
          </button>

          <a routerLink="/auth/login" class="text-center text-sm text-edaara-primary hover:underline">
            Retour à la connexion
          </a>
        </form>
      </div>
    </div>
  `,
  styles: [':host { display: block; }']
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly done = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.errorMsg.set('Lien de réinitialisation invalide.');
      return;
    }
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set(null);

    this.auth.resetPassword(token, this.form.controls.newPassword.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Token invalide ou expiré.');
      }
    });
  }
}
