import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SocialService } from '@core/services/social.service';
import { ForumPost } from '@core/models';

@Component({
  selector: 'app-forum-thread',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-8 space-y-4">
      <a routerLink="/forum" class="text-edaara-primary hover:underline text-sm">← Retour au forum</a>

      @if (post(); as p) {
        <article class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h1 class="text-2xl font-bold text-edaara-dark">{{ p.titre }}</h1>
          <p class="text-xs text-slate-500 mt-1">
            {{ p.user_prenom }} {{ p.user_nom }} · {{ p.created_at | date:'dd/MM/yyyy HH:mm' }}
          </p>
          <p class="text-slate-700 mt-4 whitespace-pre-wrap">{{ p.corps || p.contenu }}</p>
        </article>
      }

      <h2 class="text-lg font-semibold text-slate-700">Réponses ({{ replies().length }})</h2>

      @for (r of replies(); track r.id) {
        <article class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 ml-6">
          <p class="text-xs text-slate-500">
            {{ r.user_prenom }} {{ r.user_nom }} · {{ r.created_at | date:'dd/MM/yyyy HH:mm' }}
          </p>
          <p class="text-slate-700 mt-2 whitespace-pre-wrap">{{ r.corps || r.contenu }}</p>
        </article>
      } @empty {
        <p class="text-sm text-slate-500 italic">Pas encore de réponse. Soyez le premier !</p>
      }

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-2">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Votre réponse</mat-label>
          <textarea matInput rows="3" [(ngModel)]="reply"></textarea>
        </mat-form-field>
        <div class="flex justify-end">
          <button mat-flat-button color="primary" (click)="send()">
            <mat-icon>send</mat-icon> Répondre
          </button>
        </div>
      </div>
    </div>
  `
})
export class ForumThreadComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly social = inject(SocialService);

  protected readonly postId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly post = signal<ForumPost | null>(null);
  protected readonly replies = signal<ForumPost[]>([]);
  protected reply = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.social.getPost(this.postId).subscribe({
      next: (res) => {
        this.post.set(res.data?.post ?? null);
        this.replies.set(res.data?.replies ?? []);
      }
    });
  }

  send(): void {
    if (!this.reply.trim()) return;
    this.social.createPost({
      titre: 'Re: ' + (this.post()?.titre ?? ''),
      contenu: this.reply,
      parent_id: this.postId
    }).subscribe({
      next: () => {
        this.reply = '';
        this.load();
      }
    });
  }
}
