import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { SocialService } from '@core/services/social.service';
import { Badge } from '@core/models';

interface ContactUser { id: number; nom: string; prenom: string; email: string }

@Component({
  selector: 'app-admin-badges',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTabsModule, MatAutocompleteModule
  ],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Badges</h1>
        <p class="text-slate-500">Gérez les badges et attribuez-les aux apprenants</p>
      </header>

      <mat-tab-group animationDuration="150ms">

        <!-- Onglet : créer / liste des badges -->
        <mat-tab label="Badges existants">
          <div class="pt-4 space-y-4">
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 class="font-semibold text-edaara-dark text-sm">Créer un badge</h3>
              <div class="grid sm:grid-cols-2 gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Nom du badge</mat-label>
                  <input matInput [(ngModel)]="newBadge.nom" placeholder="Ex: Premier pas" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Icône (emoji)</mat-label>
                  <input matInput [(ngModel)]="newBadge.icone" placeholder="🏆" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Description</mat-label>
                  <input matInput [(ngModel)]="newBadge.description" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Points XP attribués</mat-label>
                  <input matInput type="number" [(ngModel)]="newBadge.xp_valeur" min="0" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-2">
                  <mat-label>Critère d'obtention</mat-label>
                  <input matInput [(ngModel)]="newBadge.critere" placeholder="Ex: Compléter 5 cours" />
                </mat-form-field>
              </div>
              <div class="flex justify-end">
                <button mat-flat-button color="primary" (click)="createBadge()" [disabled]="!newBadge.nom.trim()">
                  <mat-icon>add</mat-icon> Créer le badge
                </button>
              </div>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (b of badges(); track b.id) {
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex gap-3 items-start">
                  <span class="text-3xl leading-none mt-0.5">{{ b.icone || '🏅' }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-edaara-dark truncate">{{ b.nom }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ b.description }}</p>
                    @if (b.xp_valeur) {
                      <span class="inline-block mt-1.5 text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                        +{{ b.xp_valeur }} XP
                      </span>
                    }
                    @if (b.critere) {
                      <p class="text-xs text-slate-400 mt-1 italic">{{ b.critere }}</p>
                    }
                  </div>
                </div>
              } @empty {
                <div class="col-span-3 text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-100">
                  <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">emoji_events</mat-icon>
                  <p class="mt-2">Aucun badge créé</p>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Onglet : attribuer un badge -->
        <mat-tab label="Attribuer un badge">
          <div class="pt-4">
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 max-w-xl">
              <h3 class="font-semibold text-edaara-dark text-sm">Attribuer un badge à un apprenant</h3>

              <!-- Recherche utilisateur -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>Rechercher un apprenant</mat-label>
                <mat-icon matPrefix>person_search</mat-icon>
                <input matInput type="text"
                       placeholder="Nom, prénom ou email…"
                       [formControl]="userSearch"
                       [matAutocomplete]="userAuto" />
                <mat-autocomplete #userAuto="matAutocomplete"
                                  [displayWith]="displayUser"
                                  (optionSelected)="selectUser($event.option.value)">
                  @for (u of userSuggestions(); track u.id) {
                    <mat-option [value]="u">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-edaara-primary/20 text-edaara-primary flex items-center justify-center text-xs font-bold">
                          {{ (u.prenom[0] + u.nom[0]).toUpperCase() }}
                        </div>
                        <span class="font-medium">{{ u.prenom }} {{ u.nom }}</span>
                        <span class="text-xs text-slate-400">{{ u.email }}</span>
                      </div>
                    </mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              @if (selectedUser()) {
                <div class="flex items-center gap-3 bg-edaara-primary/5 rounded-lg px-3 py-2">
                  <div class="w-9 h-9 rounded-full bg-edaara-primary text-white flex items-center justify-center font-bold text-sm">
                    {{ (selectedUser()!.prenom[0] + selectedUser()!.nom[0]).toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-edaara-dark text-sm">{{ selectedUser()!.prenom }} {{ selectedUser()!.nom }}</p>
                    <p class="text-xs text-slate-500">{{ selectedUser()!.email }}</p>
                  </div>
                  <button mat-icon-button (click)="clearUser()"><mat-icon class="!text-slate-400">cancel</mat-icon></button>
                </div>
              }

              <!-- Sélection du badge -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>Badge à attribuer</mat-label>
                <mat-select [(ngModel)]="award.badge_id">
                  @for (b of badges(); track b.id) {
                    <mat-option [value]="b.id">
                      <span class="mr-1">{{ b.icone || '🏅' }}</span> {{ b.nom }}
                      @if (b.xp_valeur) { <span class="text-xs text-amber-600 ml-1">(+{{ b.xp_valeur }} XP)</span> }
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="flex justify-end">
                <button mat-flat-button color="accent"
                        (click)="awardBadge()"
                        [disabled]="!selectedUser() || !award.badge_id">
                  <mat-icon>emoji_events</mat-icon> Attribuer le badge
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
  protected readonly userSuggestions = signal<ContactUser[]>([]);
  protected readonly selectedUser = signal<ContactUser | null>(null);

  protected readonly userSearch = new FormControl('');

  protected newBadge: Partial<Badge> & { nom: string } = {
    nom: '', icone: '', description: '', xp_valeur: 0, critere: ''
  };
  protected award: { badge_id: number | null } = { badge_id: null };

  ngOnInit(): void {
    this.loadBadges();
    this.userSearch.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(v => {
        const q = typeof v === 'string' ? v.trim() : '';
        if (q.length < 2) { this.userSuggestions.set([]); return of(null); }
        return this.social.searchUsers(q);
      })
    ).subscribe(res => {
      if (res) this.userSuggestions.set(res.data?.users ?? []);
    });
  }

  loadBadges(): void {
    this.social.listAllBadges().subscribe({
      next: (res) => this.badges.set(res.data?.badges ?? [])
    });
  }

  displayUser(u: ContactUser | string | null): string {
    if (!u || typeof u === 'string') return typeof u === 'string' ? u : '';
    return `${u.prenom} ${u.nom}`;
  }

  selectUser(u: ContactUser): void {
    this.selectedUser.set(u);
    this.userSearch.setValue('', { emitEvent: false });
    this.userSuggestions.set([]);
  }

  clearUser(): void {
    this.selectedUser.set(null);
    this.userSearch.setValue('', { emitEvent: false });
  }

  createBadge(): void {
    if (!this.newBadge.nom.trim()) return;
    this.social.createBadge(this.newBadge).subscribe({
      next: () => {
        this.snack.open('Badge créé avec succès', 'OK', { duration: 2000 });
        this.newBadge = { nom: '', icone: '', description: '', xp_valeur: 0, critere: '' };
        this.loadBadges();
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  awardBadge(): void {
    const u = this.selectedUser();
    if (!u || !this.award.badge_id) return;
    this.social.awardBadge({ user_id: u.id, badge_id: this.award.badge_id }).subscribe({
      next: () => {
        const badgeName = this.badges().find(b => b.id === this.award.badge_id)?.nom ?? 'Badge';
        this.snack.open(`"${badgeName}" attribué à ${u.prenom} ${u.nom}`, 'OK', { duration: 3000 });
        this.clearUser();
        this.award = { badge_id: null };
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }
}
