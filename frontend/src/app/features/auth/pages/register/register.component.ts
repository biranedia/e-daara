import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly hidePassword = signal(true);
  readonly hideConfirm = signal(true);

  readonly form = this.fb.nonNullable.group(
    {
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordMatchValidator }
  );

  togglePassword(): void { this.hidePassword.update((v) => !v); }
  toggleConfirm(): void { this.hideConfirm.update((v) => !v); }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMsg.set(null);

    const { nom, prenom, email, password } = this.form.getRawValue();

    this.auth.register({ nom, prenom, email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/student/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 0) {
          this.errorMsg.set('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
        } else if (err?.status === 409) {
          this.errorMsg.set('Cet email est déjà enregistré. Utilisez un autre email ou connectez-vous.');
        } else {
          this.errorMsg.set(err?.error?.message ?? 'Une erreur est survenue. Réessayez.');
        }
      }
    });
  }
}
