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
import { Badge } from '@core/models';

@Component({
  selector: 'app-admin-badges',
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
        <h1 class="text-2xl font-bold text-edaara-dark">Badges</h1>
        <p class="text-slate-500">Gérez les badges de la plateforme et attribuez-les aux apprenants</p>
      </header>

      <mat-tab-group>
        <!-- Onglet : liste des badges -->
        <mat-tab label="Badges existants">
          <div class="pt-4 space-y-4">
            <!-- Formulaire création badge -->
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-2">
              <h3 class="font-semibold text-sm text-slate-600">Créer un badge</h3>
              <div class="grid sm:grid-cols-2 gap-2">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Nom</mat-label>
                  <input matInput [(ngModel)]="newBadge.nom" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Icône (emoji ou texte)</mat-label>
                  <input matInput [(ngModel)]="newBadge.icone" placeholder="🏆" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Description</mat-label>
                  <input matInput [(ngModel)]="newBadge.description" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Points XP</mat-label>
                  <input matInput type="number" [(ngModel)]="newBadge.xp_valeur" min="0" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-2">
                  <mat-label>Critère d'obtention</mat-label>
                  <input matInput [(ngModel)]="newBadge.critere" />
                </mat-form-field>
              </div>
              <div class="flex justify-end">
                <button mat-flat-button color="primary" (click)="createBadge()" [disabled]="!newBadge.nom.trim()">
                  <mat-icon>add</mat-icon> Créer
                </button>
              </div>
            </div>

            <!-- Liste -->
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (b of badges(); track b.id) {
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex gap-3 items-start">
                  <span class="text-3xl">{{ b.icone || '🏅' }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-edaara-dark truncate">{{ b.nom }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ b.description }}</p>
                    @if (b.xp_valeur) {
                      <p class="text-xs text-amber-600 font-medium mt-1">+{{ b.xp_valeur }} XP</p>
                    }
                    @if (b.critere) {
                      <p class="text-xs text-slate-400 mt-1 italic">{{ b.critere }}</p>
                    }
                  </div>
                </div>
              } @empty {
                <p class="col-span-3 text-center py-12 text-slate-500">Aucun badge créé</p>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Onglet : attribuer un badge -->
        <mat-tab label="Attribuer un badge">
          <div class="pt-4 space-y-4">
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
              <h3 class="font-semibold text-sm text-slate-600">Attribuer un badge à un apprenant</h3>
              <div class="grid sm:grid-cols-2 gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>ID de l'utilisateur</mat-label>
                  <input matInput type="number" [(ngModel)]="award.user_id" min="1" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Badge</mat-label>
                  <select matNativeControl [(ngModel)]="award.badge_id">
                    <option value="">-- Choisir --</option>
                    @for (b of badges(); track b.id) {
                      <option [value]="b.id">{{ b.icone || '🏅' }} {{ b.nom }}</option>
                    }
                  </select>
                </mat-form-field>
              </div>
              <div class="flex justify-end">
                <button mat-flat-button color="accent" (click)="awardBadge()"
                        [disabled]="!award.user_id || !award.badge_id">
                  <mat-icon>emoji_events</mat-icon> Attribuer
                </button>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class AdminBadgesComponent implements OnInit {
  private readonly social = inject(SocialService);
  private readonly snack = inject(MatSnackBar);

  protected readonly badges = signal<Badge[]>([]);

  protected newBadge: Partial<Badge> & { nom: string } = {
    nom: '', icone: '', description: '', xp_valeur: 0, critere: ''
  };

  protected award: { user_id: number | null; badge_id: number | null } = {
    user_id: null, badge_id: null
  };

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.social.listAllBadges().subscribe({
      next: (res) => this.badges.set(res.data?.badges ?? [])
    });
  }

  createBadge(): void {
    if (!this.newBadge.nom.trim()) return;
    this.social.createBadge(this.newBadge).subscribe({
      next: () => {
        this.snack.open('Badge créé', 'OK', { duration: 2000 });
        this.newBadge = { nom: '', icone: '', description: '', xp_valeur: 0, critere: '' };
        this.loadBadges();
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  awardBadge(): void {
    if (!this.award.user_id || !this.award.badge_id) return;
    this.social.awardBadge({
      user_id: this.award.user_id,
      badge_id: this.award.badge_id
    }).subscribe({
      next: () => {
        this.snack.open('Badge attribué', 'OK', { duration: 2000 });
        this.award = { user_id: null, badge_id: null };
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }
}
