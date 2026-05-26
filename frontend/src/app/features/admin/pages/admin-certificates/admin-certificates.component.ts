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
import { CourseService } from '@core/services/course.service';
import { Certificate, Course } from '@core/models';

interface ContactUser { id: number; nom: string; prenom: string; email: string }

@Component({
  selector: 'app-admin-certificates',
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
        <h1 class="text-2xl font-bold text-edaara-dark">Certificats</h1>
        <p class="text-slate-500">Émettez et vérifiez les certificats de la plateforme</p>
      </header>

      <mat-tab-group animationDuration="150ms">

        <!-- Onglet : émettre un certificat -->
        <mat-tab label="Émettre un certificat">
          <div class="pt-4">
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 max-w-xl">
              <h3 class="font-semibold text-edaara-dark text-sm">Émettre un certificat manuellement</h3>

              <!-- Recherche apprenant -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>Apprenant</mat-label>
                <mat-icon matPrefix>person_search</mat-icon>
                <input matInput type="text"
                       placeholder="Rechercher par nom ou email…"
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

              <!-- Sélection du cours (optionnel) -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>Cours associé (optionnel)</mat-label>
                <mat-icon matPrefix>menu_book</mat-icon>
                <mat-select [(ngModel)]="issue.course_id">
                  <mat-option [value]="null">— Aucun —</mat-option>
                  @for (c of courses(); track c.id) {
                    <mat-option [value]="c.id">{{ c.titre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="flex justify-end">
                <button mat-flat-button color="primary"
                        (click)="issueCert()"
                        [disabled]="!selectedUser()">
                  <mat-icon>workspace_premium</mat-icon> Émettre le certificat
                </button>
              </div>

              @if (lastIssued()) {
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p class="font-semibold text-green-800 flex items-center gap-1">
                    <mat-icon class="!text-base">check_circle</mat-icon> Certificat émis avec succès
                  </p>
                  <p class="text-sm text-green-700 mt-1">
                    Numéro de série : <span class="font-mono font-bold">{{ lastIssued() }}</span>
                  </p>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Onglet : vérifier un certificat -->
        <mat-tab label="Vérifier un certificat">
          <div class="pt-4">
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 max-w-lg">
              <h3 class="font-semibold text-edaara-dark text-sm">Vérifier l'authenticité d'un certificat</h3>
              <div class="flex gap-2">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
                  <mat-label>Numéro de série</mat-label>
                  <mat-icon matPrefix>search</mat-icon>
                  <input matInput [(ngModel)]="verifyNum" placeholder="CERT-XXXX-XXXX"
                         (keydown.enter)="verify()" />
                </mat-form-field>
                <button mat-flat-button color="primary" (click)="verify()" [disabled]="!verifyNum.trim()" class="!h-14 !mt-0.5">
                  Vérifier
                </button>
              </div>

              @if (verified() === false) {
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <mat-icon>cancel</mat-icon>
                  <span>Certificat introuvable ou invalide.</span>
                </div>
              }
              @if (verified() === true && cert()) {
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                  <p class="font-semibold text-green-800 flex items-center gap-1">
                    <mat-icon class="!text-base text-green-600">verified</mat-icon> Certificat valide
                  </p>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span class="text-slate-500">Numéro :</span>
                    <span class="font-mono font-bold text-green-800">{{ cert()!.numero_serie }}</span>
                    <span class="text-slate-500">Bénéficiaire :</span>
                    <span class="font-medium">{{ cert()!.user_prenom }} {{ cert()!.user_nom }}</span>
                    @if (cert()!.course_titre) {
                      <span class="text-slate-500">Cours :</span>
                      <span>{{ cert()!.course_titre }}</span>
                    }
                    @if (cert()!.path_titre) {
                      <span class="text-slate-500">Parcours :</span>
                      <span>{{ cert()!.path_titre }}</span>
                    }
                    <span class="text-slate-500">Émis le :</span>
                    <span>{{ cert()!.date_emission | date:'dd MMMM yyyy':'':'fr' }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Onglet : tous les certificats -->
        <mat-tab label="Tous les certificats">
          <div class="pt-4 space-y-3">
            <button mat-stroked-button (click)="loadAll()">
              <mat-icon>refresh</mat-icon> Charger / Actualiser
            </button>
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Numéro</th>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Bénéficiaire</th>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Cours / Parcours</th>
                    <th class="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of certificates(); track c.id) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3 font-mono text-xs text-edaara-primary">{{ c.numero_serie }}</td>
                      <td class="px-4 py-3 font-medium">{{ c.user_prenom }} {{ c.user_nom }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ c.course_titre ?? c.path_titre ?? '—' }}</td>
                      <td class="px-4 py-3 text-xs text-slate-500">{{ c.date_emission | date:'dd/MM/yyyy' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="py-12 text-center text-slate-400">
                        Cliquez sur "Charger" pour afficher les certificats
                      </td>
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
  private readonly courseService = inject(CourseService);
  private readonly snack = inject(MatSnackBar);

  protected readonly certificates = signal<Certificate[]>([]);
  protected readonly cert = signal<Certificate | null>(null);
  protected readonly courses = signal<Course[]>([]);
  protected readonly verified = signal<boolean | null>(null);
  protected readonly lastIssued = signal<string | null>(null);
  protected readonly userSuggestions = signal<ContactUser[]>([]);
  protected readonly selectedUser = signal<ContactUser | null>(null);

  protected readonly userSearch = new FormControl('');
  protected issue: { course_id: number | null } = { course_id: null };
  protected verifyNum = '';

  ngOnInit(): void {
    this.courseService.listPublic({ limit: 200 }).subscribe({
      next: (res) => this.courses.set(res.data?.courses ?? [])
    });
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

  loadAll(): void {
    this.social.listMyCertificates().subscribe({
      next: (res) => this.certificates.set(res.data?.certificates ?? [])
    });
  }

  issueCert(): void {
    const u = this.selectedUser();
    if (!u) return;
    const payload: { user_id: number; course_id?: number } = { user_id: u.id };
    if (this.issue.course_id) payload.course_id = this.issue.course_id;
    this.social.issueCertificate(payload).subscribe({
      next: (res) => {
        this.snack.open('Certificat émis', 'OK', { duration: 2000 });
        this.lastIssued.set(res.data?.numero_serie ?? null);
        this.clearUser();
        this.issue = { course_id: null };
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
