import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { SocialService } from '@core/services/social.service';
import { Certificate } from '@core/models';

@Component({
  selector: 'app-admin-certificates',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatTabsModule
  ],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Certificats</h1>
        <p class="text-slate-500">Émettez et vérifiez les certificats de la plateforme</p>
      </header>

      <mat-tab-group>
        <!-- Onglet : émettre un certificat -->
        <mat-tab label="Émettre un certificat">
          <div class="pt-4">
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 max-w-lg">
              <h3 class="font-semibold text-sm text-slate-600">Émettre un certificat manuellement</h3>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>ID de l'utilisateur</mat-label>
                <input matInput type="number" [(ngModel)]="issue.user_id" min="1" />
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>ID du cours (optionnel)</mat-label>
                <input matInput type="number" [(ngModel)]="issue.course_id" min="1" />
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>ID du parcours (optionnel)</mat-label>
                <input matInput type="number" [(ngModel)]="issue.path_id" min="1" />
              </mat-form-field>
              <div class="flex justify-end">
                <button mat-flat-button color="primary" (click)="issueCert()" [disabled]="!issue.user_id">
                  <mat-icon>workspace_premium</mat-icon> Émettre
                </button>
              </div>
              @if (lastIssued()) {
                <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <p class="font-semibold">Certificat émis !</p>
                  <p>Numéro de série : <span class="font-mono font-bold">{{ lastIssued() }}</span></p>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Onglet : vérifier un certificat -->
        <mat-tab label="Vérifier un certificat">
          <div class="pt-4">
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 max-w-lg">
              <h3 class="font-semibold text-sm text-slate-600">Vérifier l'authenticité d'un certificat</h3>
              <div class="flex gap-2">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
                  <mat-label>Numéro de série</mat-label>
                  <input matInput [(ngModel)]="verifyNum" placeholder="CERT-XXXX-XXXX" />
                </mat-form-field>
                <button mat-flat-button color="primary" (click)="verify()" [disabled]="!verifyNum.trim()">
                  <mat-icon>search</mat-icon>
                </button>
              </div>

              @if (verified() === false) {
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  <mat-icon class="align-middle">cancel</mat-icon>
                  Certificat introuvable ou invalide.
                </div>
              }
              @if (verified() && verified() !== false) {
                <div class="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 space-y-1">
                  <p class="font-semibold flex items-center gap-1">
                    <mat-icon class="!text-base">verified</mat-icon> Certificat valide
                  </p>
                  <p>Numéro : <span class="font-mono">{{ cert()?.numero_serie }}</span></p>
                  <p>Bénéficiaire : {{ cert()?.user_prenom }} {{ cert()?.user_nom }}</p>
                  @if (cert()?.course_titre) {
                    <p>Cours : {{ cert()?.course_titre }}</p>
                  }
                  @if (cert()?.path_titre) {
                    <p>Parcours : {{ cert()?.path_titre }}</p>
                  }
                  <p>Émis le : {{ cert()?.date_emission | date:'dd/MM/yyyy' }}</p>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Onglet : liste des certificats émis -->
        <mat-tab label="Tous les certificats">
          <div class="pt-4 space-y-2">
            <button mat-stroked-button (click)="loadAll()">
              <mat-icon>refresh</mat-icon> Charger
            </button>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500 text-left">
                    <th class="py-2 pr-4">Numéro</th>
                    <th class="py-2 pr-4">Bénéficiaire</th>
                    <th class="py-2 pr-4">Cours / Parcours</th>
                    <th class="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of certificates(); track c.id) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="py-2 pr-4 font-mono text-xs">{{ c.numero_serie }}</td>
                      <td class="py-2 pr-4">{{ c.user_prenom }} {{ c.user_nom }}</td>
                      <td class="py-2 pr-4">{{ c.course_titre ?? c.path_titre ?? '—' }}</td>
                      <td class="py-2 text-xs text-slate-500">{{ c.date_emission | date:'dd/MM/yyyy' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="py-8 text-center text-slate-400">Cliquez sur Charger</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class AdminCertificatesComponent implements OnInit {
  private readonly social = inject(SocialService);
  private readonly snack = inject(MatSnackBar);

  protected readonly certificates = signal<Certificate[]>([]);
  protected readonly cert = signal<Certificate | null>(null);
  protected readonly verified = signal<boolean | null>(null);
  protected readonly lastIssued = signal<string | null>(null);

  protected issue: { user_id: number | null; course_id: number | null; path_id: number | null } = {
    user_id: null, course_id: null, path_id: null
  };
  protected verifyNum = '';

  ngOnInit(): void {}

  loadAll(): void {
    this.social.listMyCertificates().subscribe({
      next: (res) => this.certificates.set(res.data?.certificates ?? [])
    });
  }

  issueCert(): void {
    if (!this.issue.user_id) return;
    const payload: { user_id: number; course_id?: number; path_id?: number } = {
      user_id: this.issue.user_id
    };
    if (this.issue.course_id) payload.course_id = this.issue.course_id;
    if (this.issue.path_id) payload.path_id = this.issue.path_id;

    this.social.issueCertificate(payload).subscribe({
      next: (res) => {
        this.snack.open('Certificat émis', 'OK', { duration: 2000 });
        this.lastIssued.set(res.data?.numero_serie ?? null);
        this.issue = { user_id: null, course_id: null, path_id: null };
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  verify(): void {
    if (!this.verifyNum.trim()) return;
    this.verified.set(null);
    this.cert.set(null);
    this.social.verifyCertificate(this.verifyNum.trim()).subscribe({
      next: (res) => {
        if (res.success && res.data?.certificate) {
          this.cert.set(res.data.certificate);
          this.verified.set(true);
        } else {
          this.verified.set(false);
        }
      },
      error: () => this.verified.set(false)
    });
  }
}
