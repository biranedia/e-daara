import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@core/services/auth.service';
import { TokenStorageService } from '@core/services/token-storage.service';

/**
 * Page de retour OAuth : réceptionne les tokens depuis les query params
 * (poussés par /api/auth/oauth/{google|facebook}/callback côté back),
 * les stocke, charge le profil utilisateur, puis redirige vers l'accueil.
 */
@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-edaara-light to-slate-200 p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        @if (status() === 'loading') {
          <mat-spinner diameter="48" class="mx-auto"></mat-spinner>
          <h1 class="text-xl font-bold text-edaara-dark mt-4">Connexion en cours...</h1>
          <p class="text-slate-500 text-sm mt-2">
            Récupération de votre profil sur E-DAARA.
          </p>
        } @else if (status() === 'error') {
          <div class="text-red-500 text-5xl">⚠</div>
          <h1 class="text-xl font-bold text-edaara-dark mt-4">Connexion impossible</h1>
          <p class="text-slate-500 text-sm mt-2">{{ errorMsg() }}</p>
          <a mat-flat-button color="primary" routerLink="/auth/login" class="mt-6">
            Retour à la connexion
          </a>
        }
      </div>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly storage = inject(TokenStorageService);

  readonly status = signal<'loading' | 'error'>('loading');
  readonly errorMsg = signal<string>('');

  ngOnInit(): void {
    const access = this.route.snapshot.queryParamMap.get('accessToken');
    const refresh = this.route.snapshot.queryParamMap.get('refreshToken');
    const err = this.route.snapshot.queryParamMap.get('error');

    if (err) {
      this.status.set('error');
      this.errorMsg.set(this.translateError(err));
      return;
    }

    if (!access || !refresh) {
      this.status.set('error');
      this.errorMsg.set('Tokens manquants dans la redirection.');
      return;
    }

    // Stocker les tokens, puis charger le profil pour récupérer les rôles
    this.storage.saveTokens(access, refresh);
    this.auth.loadProfile().subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.status.set('error');
        this.errorMsg.set('Profil utilisateur introuvable après authentification.');
        this.storage.clear();
      }
    });
  }

  private translateError(code: string): string {
    const map: Record<string, string> = {
      oauth_failed: 'Le fournisseur OAuth a rejeté la demande.',
      oauth_no_user: 'Aucun utilisateur reçu après authentification.',
      oauth_server: 'Erreur serveur lors du traitement OAuth.',
      google_failed: 'Connexion Google échouée.',
      facebook_failed: 'Connexion Facebook échouée.',
      google_not_configured: 'Connexion Google indisponible (configuration manquante côté serveur).',
      facebook_not_configured: 'Connexion Facebook indisponible (configuration manquante côté serveur).'
    };
    return map[code] ?? `Erreur OAuth : ${code}`;
  }
}
