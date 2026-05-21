import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { SocialService } from '@core/services/social.service';
import { Message } from '@core/models';

interface ContactUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  avatar?: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatTabsModule, MatAutocompleteModule
  ],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-8 space-y-4">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Messagerie</h1>
          <p class="text-slate-500 text-sm">Communiquez avec vos contacts</p>
        </div>
        <button mat-flat-button color="primary" (click)="toggleCompose()">
          <mat-icon>edit</mat-icon>
          Nouveau message
        </button>
      </header>

      <!-- Formulaire de composition -->
      @if (showCompose()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-edaara-dark">Nouveau message</h3>
            <button mat-icon-button (click)="toggleCompose()" aria-label="Fermer">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Recherche destinataire -->
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
            <mat-label>Destinataire</mat-label>
            <mat-icon matPrefix>person_search</mat-icon>
            <input
              matInput
              type="text"
              placeholder="Rechercher par nom ou email…"
              [formControl]="searchCtrl"
              [matAutocomplete]="auto"
            />
            <mat-autocomplete
              #auto="matAutocomplete"
              [displayWith]="displayUser"
              (optionSelected)="selectRecipient($event.option.value)">
              @for (u of suggestions(); track u.id) {
                <mat-option [value]="u">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-edaara-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {{ (u.prenom[0] + u.nom[0]).toUpperCase() }}
                    </div>
                    <div>
                      <span class="font-medium">{{ u.prenom }} {{ u.nom }}</span>
                      <span class="text-xs text-slate-500 ml-1">{{ u.email }}</span>
                    </div>
                  </div>
                </mat-option>
              }
              @if (suggestions().length === 0 && searchCtrl.value && searchCtrl.value.length >= 2) {
                <mat-option disabled>Aucun utilisateur trouvé</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>

          <!-- Destinataire sélectionné -->
          @if (recipient()) {
            <div class="flex items-center gap-2 bg-edaara-primary/10 rounded-lg px-3 py-2">
              <div class="w-8 h-8 rounded-full bg-edaara-primary text-white flex items-center justify-center text-sm font-bold">
                {{ (recipient()!.prenom[0] + recipient()!.nom[0]).toUpperCase() }}
              </div>
              <div class="flex-1">
                <span class="font-medium text-edaara-dark">{{ recipient()!.prenom }} {{ recipient()!.nom }}</span>
                <span class="text-xs text-slate-500 ml-2">{{ recipient()!.email }}</span>
              </div>
              <button mat-icon-button (click)="clearRecipient()" aria-label="Retirer">
                <mat-icon class="!text-slate-400">cancel</mat-icon>
              </button>
            </div>
          }

          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
            <mat-label>Sujet (optionnel)</mat-label>
            <input matInput [(ngModel)]="newMsg.sujet" placeholder="Ex: Question sur le cours…" />
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
            <mat-label>Message</mat-label>
            <textarea matInput rows="4" [(ngModel)]="newMsg.contenu" placeholder="Écrivez votre message…"></textarea>
          </mat-form-field>

          <div class="flex justify-end gap-2">
            <button mat-button (click)="toggleCompose()">Annuler</button>
            <button mat-flat-button color="primary" (click)="send()" [disabled]="!recipient() || !newMsg.contenu.trim()">
              <mat-icon>send</mat-icon> Envoyer
            </button>
          </div>
        </div>
      }

      <!-- Onglets boîte de réception / envoyés -->
      <mat-tab-group (selectedIndexChange)="onTabChange($event)" animationDuration="150ms">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-1">inbox</mat-icon>
            Reçus
            @if (unreadCount() > 0) {
              <span class="ml-2 bg-edaara-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                {{ unreadCount() }}
              </span>
            }
          </ng-template>
          <div class="space-y-2 mt-3">
            <ng-container *ngTemplateOutlet="messageList; context: { $implicit: messages() }"></ng-container>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-1">send</mat-icon>
            Envoyés
          </ng-template>
          <div class="space-y-2 mt-3">
            <ng-container *ngTemplateOutlet="messageList; context: { $implicit: sentMessages(), isSent: true }"></ng-container>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Template réutilisable pour la liste de messages -->
    <ng-template #messageList let-list let-isSent="isSent">
      @for (m of list; track m.id) {
        <article
          class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 transition-shadow hover:shadow-md cursor-pointer"
          [class.border-l-4]="!m.lu_at"
          [class.border-l-edaara-primary]="!m.lu_at"
          (click)="expand(m)">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-9 h-9 rounded-full bg-edaara-primary/20 text-edaara-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {{ isSent ? avatarInitialsDest(m) : avatarInitials(m) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-edaara-dark truncate">
                  @if (isSent) {
                    <span class="text-xs text-slate-400 mr-1">À :</span>
                    {{ m.destinataire_prenom }} {{ m.destinataire_nom }}
                  } @else {
                    {{ m.expediteur_prenom }} {{ m.expediteur_nom }}
                  }
                  @if (!m.lu_at) {
                    <span class="ml-2 px-2 py-0.5 bg-edaara-primary text-white rounded-full text-xs align-middle">Nouveau</span>
                  }
                </p>
                @if (m.sujet) {
                  <p class="text-sm font-semibold text-slate-700 truncate">{{ m.sujet }}</p>
                }
                <p class="text-xs text-slate-500 truncate">{{ m.corps || m.contenu }}</p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <p class="text-xs text-slate-400">{{ m.created_at | date:'dd/MM HH:mm' }}</p>
              <div class="flex gap-1">
                @if (!m.lu_at) {
                  <button mat-icon-button class="!w-7 !h-7" (click)="$event.stopPropagation(); markRead(m)" title="Marquer lu">
                    <mat-icon class="!text-sm text-edaara-primary">mark_email_read</mat-icon>
                  </button>
                }
                <button mat-icon-button class="!w-7 !h-7" (click)="$event.stopPropagation(); remove(m)" title="Supprimer">
                  <mat-icon class="!text-sm text-red-400">delete</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Corps du message (expandable) -->
          @if (expandedId() === m.id) {
            <div class="mt-3 pt-3 border-t border-slate-100">
              <p class="text-slate-700 text-sm whitespace-pre-wrap">{{ m.corps || m.contenu }}</p>
              <div class="mt-3 flex justify-end">
                <button mat-stroked-button color="primary" (click)="$event.stopPropagation(); replyTo(m)">
                  <mat-icon>reply</mat-icon> Répondre
                </button>
              </div>
            </div>
          }
        </article>
      } @empty {
        <div class="bg-white rounded-xl p-12 text-center border border-slate-100">
          <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">mail_outline</mat-icon>
          <p class="text-slate-500 mt-3">Aucun message</p>
        </div>
      }
    </ng-template>
  `
})
export class MessagesComponent implements OnInit {
  private readonly social = inject(SocialService);
  private readonly snack = inject(MatSnackBar);

  protected readonly messages = signal<Message[]>([]);
  protected readonly sentMessages = signal<Message[]>([]);
  protected readonly showCompose = signal(false);
  protected readonly expandedId = signal<number | null>(null);
  protected readonly suggestions = signal<ContactUser[]>([]);
  protected readonly recipient = signal<ContactUser | null>(null);

  protected readonly searchCtrl = new FormControl('');

  protected newMsg = { sujet: '', contenu: '' };

  protected readonly unreadCount = computed(
    () => this.messages().filter(m => !m.lu_at).length
  );

  ngOnInit(): void {
    this.loadInbox();
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(v => {
        const q = typeof v === 'string' ? v.trim() : '';
        if (q.length < 2) { this.suggestions.set([]); return of(null); }
        return this.social.searchUsers(q);
      })
    ).subscribe(res => {
      if (res) this.suggestions.set(res.data?.users ?? []);
    });
  }

  loadInbox(): void {
    this.social.listMessages().subscribe({
      next: (res) => this.messages.set(res.data?.messages ?? [])
    });
  }

  loadSent(): void {
    this.social.listMessages('sent').subscribe({
      next: (res) => this.sentMessages.set(res.data?.messages ?? [])
    });
  }

  onTabChange(idx: number): void {
    if (idx === 1 && this.sentMessages().length === 0) this.loadSent();
  }

  toggleCompose(): void {
    this.showCompose.update(v => !v);
    if (!this.showCompose()) this.resetCompose();
  }

  resetCompose(): void {
    this.newMsg = { sujet: '', contenu: '' };
    this.recipient.set(null);
    this.searchCtrl.setValue('', { emitEvent: false });
    this.suggestions.set([]);
  }

  displayUser(u: ContactUser | string | null): string {
    if (!u || typeof u === 'string') return typeof u === 'string' ? u : '';
    return `${u.prenom} ${u.nom}`;
  }

  selectRecipient(u: ContactUser): void {
    this.recipient.set(u);
    this.searchCtrl.setValue('', { emitEvent: false });
    this.suggestions.set([]);
  }

  clearRecipient(): void {
    this.recipient.set(null);
    this.searchCtrl.setValue('', { emitEvent: false });
  }

  send(): void {
    const r = this.recipient();
    if (!r || !this.newMsg.contenu.trim()) return;
    this.social.sendMessage({
      destinataire_id: r.id,
      sujet: this.newMsg.sujet,
      contenu: this.newMsg.contenu
    }).subscribe({
      next: () => {
        this.snack.open(`Message envoyé à ${r.prenom} ${r.nom}`, 'OK', { duration: 2000 });
        this.resetCompose();
        this.showCompose.set(false);
        this.loadSent();
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? "Erreur lors de l'envoi", 'OK', { duration: 3000 });
      }
    });
  }

  expand(m: Message): void {
    this.expandedId.update(id => id === m.id ? null : m.id);
    if (!m.lu_at) this.markRead(m);
  }

  avatarInitials(m: Message): string {
    const p = m.expediteur_prenom?.[0] ?? '';
    const n = m.expediteur_nom?.[0] ?? '';
    return (p + n).toUpperCase() || '?';
  }

  avatarInitialsDest(m: Message): string {
    const p = m.destinataire_prenom?.[0] ?? '';
    const n = m.destinataire_nom?.[0] ?? '';
    return (p + n).toUpperCase() || '?';
  }

  markRead(m: Message): void {
    this.social.markMessageRead(m.id).subscribe({
      next: () => this.loadInbox()
    });
  }

  remove(m: Message): void {
    this.social.deleteMessage(m.id).subscribe({
      next: () => {
        this.loadInbox();
        if (this.sentMessages().some(s => s.id === m.id)) this.loadSent();
      }
    });
  }

  replyTo(m: Message): void {
    this.recipient.set({
      id: m.expediteur_id,
      nom: m.expediteur_nom ?? '',
      prenom: m.expediteur_prenom ?? '',
      email: ''
    });
    this.newMsg.sujet = m.sujet ? `Re: ${m.sujet}` : '';
    this.showCompose.set(true);
    this.expandedId.set(null);
  }
}
