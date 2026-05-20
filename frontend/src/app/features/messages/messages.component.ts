import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocialService } from '@core/services/social.service';
import { Message } from '@core/models';

@Component({
  selector: 'app-messages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-8 space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Messagerie</h1>
        <p class="text-slate-500">{{ messages().length }} message(s)</p>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-2">
        <h3 class="font-semibold text-edaara-dark">Nouveau message</h3>
        <div class="grid sm:grid-cols-2 gap-2">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Destinataire (ID utilisateur)</mat-label>
            <input matInput type="number" [(ngModel)]="newMsg.destinataire_id" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Sujet</mat-label>
            <input matInput [(ngModel)]="newMsg.sujet" />
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Contenu</mat-label>
          <textarea matInput rows="3" [(ngModel)]="newMsg.contenu"></textarea>
        </mat-form-field>
        <div class="flex justify-end">
          <button mat-flat-button color="primary" (click)="send()">
            <mat-icon>send</mat-icon> Envoyer
          </button>
        </div>
      </div>

      <div class="space-y-2">
        @for (m of messages(); track m.id) {
          <article class="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
                   [class.border-l-4]="!m.lu_at"
                   [class.border-l-edaara-primary]="!m.lu_at">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm">
                  <strong>{{ m.expediteur_prenom }} {{ m.expediteur_nom }}</strong>
                  @if (!m.lu_at) {
                    <span class="ml-2 px-2 py-0.5 bg-edaara-primary text-white rounded-full text-xs">Non lu</span>
                  }
                </p>
                @if (m.sujet) {
                  <p class="font-semibold text-edaara-dark mt-1">{{ m.sujet }}</p>
                }
              </div>
              <p class="text-xs text-slate-500">{{ m.created_at | date:'dd/MM HH:mm' }}</p>
            </div>
            <p class="text-slate-700 mt-2 text-sm whitespace-pre-wrap">{{ m.corps || m.contenu }}</p>
            <div class="flex justify-end gap-1 mt-2">
              @if (!m.lu_at) {
                <button mat-button (click)="markRead(m)">Marquer lu</button>
              }
              <button mat-icon-button (click)="remove(m)" aria-label="Supprimer">
                <mat-icon class="!text-red-500">delete</mat-icon>
              </button>
            </div>
          </article>
        } @empty {
          <p class="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-100">
            Aucun message
          </p>
        }
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit {
  private readonly social = inject(SocialService);
  private readonly snack = inject(MatSnackBar);

  protected readonly messages = signal<Message[]>([]);
  protected newMsg: { destinataire_id: number | null; sujet: string; contenu: string } = {
    destinataire_id: null, sujet: '', contenu: ''
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.social.listMessages().subscribe({
      next: (res) => this.messages.set(res.data?.messages ?? [])
    });
  }

  send(): void {
    if (!this.newMsg.destinataire_id || !this.newMsg.contenu.trim()) return;
    this.social.sendMessage({
      destinataire_id: this.newMsg.destinataire_id,
      sujet: this.newMsg.sujet,
      contenu: this.newMsg.contenu
    }).subscribe({
      next: () => {
        this.newMsg = { destinataire_id: null, sujet: '', contenu: '' };
        this.snack.open('Message envoyé', 'OK', { duration: 1500 });
        this.load();
      }
    });
  }

  markRead(m: Message): void {
    this.social.markMessageRead(m.id).subscribe({ next: () => this.load() });
  }

  remove(m: Message): void {
    this.social.deleteMessage(m.id).subscribe({ next: () => this.load() });
  }
}
