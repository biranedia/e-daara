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

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Titre</mat-label>
          <input matInput [(ngModel)]="newA.titre" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Contenu</mat-label>
          <textarea matInput [(ngModel)]="newA.contenu" rows="3"></textarea>
        </mat-form-field>
        <div class="flex justify-end">
          <button mat-flat-button color="primary" (click)="publish()">
            <mat-icon>send</mat-icon> Publier
          </button>
        </div>
      </div>

      <div class="space-y-3">
        @for (a of items(); track a.id) {
          <article class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <h3 class="font-semibold text-edaara-dark">{{ a.titre }}</h3>
            <p class="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{{ a.corps || a.contenu }}</p>
            <p class="text-xs text-slate-400 mt-2">{{ a.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
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
  protected newA: { titre: string; contenu: string } = { titre: '', contenu: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.social.listAnnouncements().subscribe({
      next: (res) => this.items.set(res.data?.announcements ?? [])
    });
  }

  publish(): void {
    if (!this.newA.titre.trim() || !this.newA.contenu.trim()) return;
    this.social.createAnnouncement(this.newA).subscribe({
      next: () => {
        this.newA = { titre: '', contenu: '' };
        this.snack.open('Annonce publiée', 'OK', { duration: 1500 });
        this.load();
      }
    });
  }
}
