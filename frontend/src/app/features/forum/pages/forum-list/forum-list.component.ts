import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocialService } from '@core/services/social.service';
import { ForumPost } from '@core/models';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-8 space-y-4">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Forum communautaire</h1>
          <p class="text-slate-500">Échangez avec les autres apprenants</p>
        </div>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Titre de votre sujet</mat-label>
          <input matInput [(ngModel)]="newPost.titre" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Contenu</mat-label>
          <textarea matInput rows="3" [(ngModel)]="newPost.contenu"></textarea>
        </mat-form-field>
        <div class="flex justify-end">
          <button mat-flat-button color="primary" (click)="publish()">
            <mat-icon>send</mat-icon> Publier
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
        @for (p of posts(); track p.id) {
          <a [routerLink]="['/forum', p.id]" class="block p-4 hover:bg-slate-50 transition-colors">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <h3 class="font-semibold text-edaara-dark">{{ p.titre }}</h3>
                <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ p.corps || p.contenu }}</p>
                <p class="text-xs text-slate-500 mt-2">
                  Par {{ p.user_prenom }} {{ p.user_nom }} ·
                  {{ p.created_at | date:'dd/MM/yyyy HH:mm' }}
                  · {{ p.nb_replies || 0 }} réponse(s)
                </p>
              </div>
              <mat-icon class="text-slate-400">chevron_right</mat-icon>
            </div>
          </a>
        } @empty {
          <p class="p-12 text-center text-slate-500">Aucun sujet pour l'instant. Lancez la conversation !</p>
        }
      </div>
    </div>
  `
})
export class ForumListComponent implements OnInit {
  private readonly social = inject(SocialService);
  private readonly snack = inject(MatSnackBar);

  protected readonly posts = signal<ForumPost[]>([]);
  protected newPost: { titre: string; contenu: string } = { titre: '', contenu: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.social.listPosts().subscribe({
      next: (res) => this.posts.set(res.data?.posts ?? [])
    });
  }

  publish(): void {
    if (!this.newPost.titre.trim() || !this.newPost.contenu.trim()) return;
    this.social.createPost(this.newPost).subscribe({
      next: () => {
        this.newPost = { titre: '', contenu: '' };
        this.snack.open('Sujet publié', 'OK', { duration: 1500 });
        this.load();
      }
    });
  }
}
