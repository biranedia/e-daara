import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocialService } from '@core/services/social.service';
import { Announcement } from '@core/models';

@Component({
  selector: 'app-instructor-announcements',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Annonces</h1>
        <p class="text-slate-500">Publiez des annonces à destination de vos apprenants</p>
      </header>

      <!-- Formulaire nouvelle annonce / édition -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-2">
        <h3 class="font-semibold text-sm text-slate-600">
          {{ editingId() ? 'Modifier l\'annonce' : 'Nouvelle annonce' }}
        </h3>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Titre</mat-label>
          <input matInput [(ngModel)]="form.titre" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Contenu</mat-label>
          <textarea matInput [(ngModel)]="form.contenu" rows="3"></textarea>
        </mat-form-field>
        <div class="flex justify-end gap-2">
          @if (editingId()) {
            <button mat-stroked-button (click)="cancelEdit()">Annuler</button>
          }
          <button mat-flat-button color="primary" (click)="submit()" [disabled]="!form.titre.trim() || !form.contenu.trim()">
            <mat-icon>{{ editingId() ? 'save' : 'send' }}</mat-icon>
            {{ editingId() ? 'Enregistrer' : 'Publier' }}
          </button>
        </div>
      </div>

      <!-- Liste des annonces -->
      <div class="space-y-3">
        @for (a of items(); track a.id) {
          <article class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <h3 class="font-semibold text-edaara-dark">{{ a.titre }}</h3>
                <p class="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{{ a.corps || a.contenu }}</p>
                <p class="text-xs text-slate-400 mt-2">{{ a.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div class="flex gap-1 shrink-0">
                <button mat-icon-button (click)="startEdit(a)" aria-label="Modifier">
                  <mat-icon class="!text-slate-500">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="remove(a)" aria-label="Supprimer">
                  <mat-icon class="!text-red-500">delete</mat-icon>
                </button>
              </div>
            </div>
          </article>
        } @empty {
          <p class="text-center py-12 text-slate-500">Aucune annonce</p>
        }
      </div>
    </div>
  `
})
export class InstructorAnnouncementsComponent implements OnInit {
  private readonly social = inject(SocialService);
  private readonly snack = inject(MatSnackBar);

  protected readonly items = signal<Announcement[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected form: { titre: string; contenu: string } = { titre: '', contenu: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.social.listAnnouncements().subscribe({
      next: (res) => this.items.set(res.data?.announcements ?? [])
    });
  }

  submit(): void {
    if (!this.form.titre.trim() || !this.form.contenu.trim()) return;
    const id = this.editingId();
    const obs = id
      ? this.social.updateAnnouncement(id, this.form)
      : this.social.createAnnouncement(this.form);

    obs.subscribe({
      next: () => {
        this.snack.open(id ? 'Annonce modifiée' : 'Annonce publiée', 'OK', { duration: 1500 });
        this.cancelEdit();
        this.load();
      },
      error: () => this.snack.open('Erreur', 'OK', { duration: 3000 })
    });
  }

  startEdit(a: Announcement): void {
    this.editingId.set(a.id);
    this.form = { titre: a.titre, contenu: a.corps ?? a.contenu ?? '' };
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form = { titre: '', contenu: '' };
  }

  remove(a: Announcement): void {
    if (!confirm(`Supprimer l'annonce "${a.titre}" ?`)) return;
    this.social.deleteAnnouncement(a.id).subscribe({
      next: () => {
        this.snack.open('Annonce supprimée', 'OK', { duration: 1500 });
        this.load();
      }
    });
  }
}
