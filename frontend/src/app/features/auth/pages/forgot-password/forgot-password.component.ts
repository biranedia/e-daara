import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
        <h1 class="text-2xl font-bold text-edaara-dark text-center mb-2">Mot de passe oublié</h1>
        <p class="text-slate-500 text-center mb-6 text-sm">
          Entrez votre email, nous vous enverrons un lien de réinitialisation.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          @if (sent()) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
              Si cet email est enregistré, un lien de réinitialisation a été envoyé.
            </div>
          }

          <button mat-flat-button color="primary" type="submit"
                  [disabled]="form.invalid || loading()" class="!h-12">
            Envoyer le lien
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
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly sent = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.forgotPassword(this.form.controls.email.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.sent.set(true); // backend renvoie volontairement la même réponse
      }
    });
  }
}
