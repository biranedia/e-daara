var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { SocialService } from '@core/services/social.service';
let AdminMessagesComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-admin-messages',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [
                CommonModule, FormsModule, ReactiveFormsModule,
                MatButtonModule, MatIconModule, MatFormFieldModule,
                MatInputModule, MatAutocompleteModule, MatTooltipModule
            ],
            template: `
    <div class="space-y-4">

      <!-- En-tete -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark flex items-center gap-2">
            <mat-icon class="text-edaara-primary">forum</mat-icon>
            Messagerie
          </h1>
          <p class="text-slate-500 text-sm">
            {{ allMessages().length }} message(s) sur la plateforme
            @if (unreadCount() > 0) {
              &middot; <span class="text-edaara-primary font-semibold">{{ unreadCount() }} non lu(s)</span>
            }
          </p>
        </div>
        <button mat-flat-button color="primary" (click)="toggleCompose()">
          <mat-icon>edit</mat-icon> Nouveau message
        </button>
      </header>

      <!-- Formulaire de composition -->
      @if (showCompose()) {
        <div class="bg-white rounded-xl shadow-sm border border-edaara-primary/30 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-edaara-dark">Nouveau message</h3>
            <button mat-icon-button (click)="toggleCompose()"><mat-icon>close</mat-icon></button>
          </div>

          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
            <mat-label>Destinataire</mat-label>
            <mat-icon matPrefix>person_search</mat-icon>
            <input matInput type="text" placeholder="Tapez un nom ou email..."
                   [formControl]="recipientCtrl" [matAutocomplete]="auto" />
            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayUser"
                              (optionSelected)="selectRecipient($event.option.value)">
              @for (u of suggestions(); track u.id) {
                <mat-option [value]="u">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-edaara-primary text-white flex items-center justify-center text-xs font-bold">
                      {{ (u.prenom[0] + u.nom[0]).toUpperCase() }}
                    </div>
                    <span class="font-medium">{{ u.prenom }} {{ u.nom }}</span>
                    <span class="text-xs text-slate-400">{{ u.email }}</span>
                  </div>
                </mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>

          @if (recipient()) {
            <div class="flex items-center gap-3 bg-edaara-primary/5 rounded-lg px-3 py-2">
              <div class="w-8 h-8 rounded-full bg-edaara-primary text-white flex items-center justify-center text-sm font-bold">
                {{ (recipient()!.prenom[0] + recipient()!.nom[0]).toUpperCase() }}
              </div>
              <div class="flex-1 text-sm">
                <span class="font-medium">{{ recipient()!.prenom }} {{ recipient()!.nom }}</span>
                <span class="text-slate-400 ml-2">{{ recipient()!.email }}</span>
              </div>
              <button mat-icon-button (click)="clearRecipient()">
                <mat-icon class="!text-slate-400">cancel</mat-icon>
              </button>
            </div>
          }

          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
            <mat-label>Sujet (optionnel)</mat-label>
            <input matInput [(ngModel)]="compose.sujet" />
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
            <mat-label>Message</mat-label>
            <textarea matInput rows="4" [(ngModel)]="compose.corps"
                      placeholder="Ecrivez votre message..."></textarea>
          </mat-form-field>

          <div class="flex justify-end gap-2">
            <button mat-button (click)="toggleCompose()">Annuler</button>
            <button mat-flat-button color="primary" (click)="send()"
                    [disabled]="!recipient() || !compose.corps.trim()">
              <mat-icon>send</mat-icon> Envoyer
            </button>
          </div>
        </div>
      }

      <!-- Barre de recherche principale -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 px-4 py-3 flex gap-3 items-center">
        <mat-icon class="text-slate-400 flex-shrink-0">search</mat-icon>
        <input type="text"
               [value]="searchText()"
               (input)="searchText.set($any($event.target).value)"
               placeholder="Rechercher par nom, email, sujet ou contenu..."
               class="flex-1 outline-none text-slate-700 placeholder:text-slate-400 bg-transparent text-sm" />
        @if (searchText()) {
          <button mat-icon-button class="!w-8 !h-8" (click)="searchText.set('')">
            <mat-icon class="!text-slate-400 !text-base">close</mat-icon>
          </button>
        }
        <button mat-stroked-button (click)="load()" matTooltip="Actualiser">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <!-- Filtres rapides -->
      <div class="flex flex-wrap gap-2">
        @for (f of filters; track f.value) {
          <button (click)="activeFilter.set(f.value)"
                  class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                  [class]="activeFilter() === f.value
                    ? 'bg-edaara-primary text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'">
            <mat-icon class="!text-sm">{{ f.icon }}</mat-icon>
            {{ f.label }}
            @if (f.value === 'unread' && unreadCount() > 0) {
              <span class="ml-0.5 bg-white text-edaara-primary text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {{ unreadCount() }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Liste des messages -->
      @if (filtered().length === 0) {
        <div class="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <mat-icon class="!text-5xl text-slate-300">
            {{ searchText() ? 'search_off' : 'mail_outline' }}
          </mat-icon>
          <p class="text-slate-500 mt-3">
            {{ searchText() ? 'Aucun resultat pour "' + searchText() + '"' : 'Aucun message' }}
          </p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (m of filtered(); track m.id) {
            <article class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-shadow hover:shadow-md"
                     [class.border-l-4]="!m.lu_at"
                     [class.border-l-edaara-primary]="!m.lu_at">

              <!-- En-tete du message -->
              <div class="p-4 cursor-pointer flex items-start gap-3" (click)="expand(m)">

                <!-- Avatar -->
                <div class="w-10 h-10 rounded-full bg-edaara-primary/15 text-edaara-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {{ initials(m) }}
                </div>

                <!-- Contenu principal -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="font-semibold text-edaara-dark text-sm truncate">
                        <span class="text-slate-400 font-normal text-xs">De : </span>
                        {{ m.expediteur_prenom }} {{ m.expediteur_nom }}
                        <span class="text-slate-300 mx-1">&#8594;</span>
                        <span class="text-slate-400 font-normal text-xs">A : </span>
                        {{ m.destinataire_prenom }} {{ m.destinataire_nom }}
                      </p>
                      @if (m.sujet) {
                        <p class="text-sm font-medium text-slate-700 truncate mt-0.5">{{ m.sujet }}</p>
                      }
                      <p class="text-xs text-slate-400 truncate mt-0.5">{{ m.corps }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1 flex-shrink-0">
                      <span class="text-xs text-slate-400">{{ m.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                      @if (!m.lu_at) {
                        <span class="text-xs bg-edaara-primary text-white px-2 py-0.5 rounded-full">Nouveau</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Corps developpe -->
              @if (expandedId() === m.id) {
                <div class="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50">
                  <p class="text-sm text-slate-700 whitespace-pre-wrap py-3">{{ m.corps }}</p>
                  <div class="flex gap-2 justify-end mt-2">
                    <button mat-stroked-button color="primary" (click)="replyTo(m); $event.stopPropagation()">
                      <mat-icon>reply</mat-icon> Repondre
                    </button>
                    <button mat-stroked-button color="warn" (click)="remove(m); $event.stopPropagation()">
                      <mat-icon>delete</mat-icon> Supprimer
                    </button>
                  </div>
                </div>
              }
            </article>
          }
        </div>
      }

      <!-- Compteur resultats -->
      @if (searchText() && filtered().length > 0) {
        <p class="text-xs text-center text-slate-400">
          {{ filtered().length }} resultat(s) pour "{{ searchText() }}"
        </p>
      }
    </div>
  `
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminMessagesComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminMessagesComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        social = inject(SocialService);
        snack = inject(MatSnackBar);
        allMessages = signal([]);
        expandedId = signal(null);
        showCompose = signal(false);
        suggestions = signal([]);
        recipient = signal(null);
        activeFilter = signal('all');
        searchText = signal('');
        compose = { sujet: '', corps: '' };
        recipientCtrl = new FormControl('');
        filters = [
            { value: 'all', label: 'Tous', icon: 'all_inbox' },
            { value: 'unread', label: 'Non lus', icon: 'mark_email_unread' },
            { value: 'inbox', label: 'Recus', icon: 'inbox' },
            { value: 'sent', label: 'Envoyes', icon: 'send' }
        ];
        unreadCount = computed(() => this.allMessages().filter(m => !m.lu_at).length);
        filtered = computed(() => {
            let list = this.allMessages();
            switch (this.activeFilter()) {
                case 'unread':
                    list = list.filter(m => !m.lu_at);
                    break;
                case 'inbox':
                    list = list.filter(m => m.destinataire_id != null);
                    break;
                case 'sent':
                    list = list.filter(m => m.expediteur_id != null);
                    break;
            }
            const q = this.searchText().trim().toLowerCase();
            if (!q)
                return list;
            return list.filter(m => (m.expediteur_nom ?? '').toLowerCase().includes(q) ||
                (m.expediteur_prenom ?? '').toLowerCase().includes(q) ||
                (m.destinataire_nom ?? '').toLowerCase().includes(q) ||
                (m.destinataire_prenom ?? '').toLowerCase().includes(q) ||
                (m.sujet ?? '').toLowerCase().includes(q) ||
                (m.corps ?? '').toLowerCase().includes(q) ||
                (m.contenu ?? '').toLowerCase().includes(q));
        });
        ngOnInit() {
            this.load();
            this.recipientCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), switchMap(v => {
                const q = typeof v === 'string' ? v.trim() : '';
                if (q.length < 2) {
                    this.suggestions.set([]);
                    return of(null);
                }
                return this.social.searchUsers(q);
            })).subscribe(res => {
                if (res)
                    this.suggestions.set(res.data?.users ?? []);
            });
        }
        load() {
            // box=all => l'admin voit tous les messages de la plateforme
            this.social.listMessages('all').subscribe({
                next: (res) => this.allMessages.set(res.data?.messages ?? [])
            });
        }
        expand(m) {
            this.expandedId.update(id => id === m.id ? null : m.id);
            if (!m.lu_at)
                this.markRead(m);
        }
        initials(m) {
            const p = m.expediteur_prenom?.[0] ?? '';
            const n = m.expediteur_nom?.[0] ?? '';
            return (p + n).toUpperCase() || '?';
        }
        toggleCompose() {
            this.showCompose.update(v => !v);
            if (!this.showCompose())
                this.resetCompose();
        }
        resetCompose() {
            this.compose = { sujet: '', corps: '' };
            this.recipient.set(null);
            this.recipientCtrl.setValue('', { emitEvent: false });
            this.suggestions.set([]);
        }
        displayUser(u) {
            if (!u || typeof u === 'string')
                return typeof u === 'string' ? u : '';
            return `${u.prenom} ${u.nom}`;
        }
        selectRecipient(u) {
            this.recipient.set(u);
            this.recipientCtrl.setValue('', { emitEvent: false });
            this.suggestions.set([]);
        }
        clearRecipient() {
            this.recipient.set(null);
            this.recipientCtrl.setValue('', { emitEvent: false });
        }
        send() {
            const r = this.recipient();
            if (!r || !this.compose.corps.trim())
                return;
            this.social.sendMessage({
                destinataire_id: r.id,
                sujet: this.compose.sujet,
                contenu: this.compose.corps
            }).subscribe({
                next: () => {
                    this.snack.open(`Message envoye a ${r.prenom} ${r.nom}`, 'OK', { duration: 2500 });
                    this.resetCompose();
                    this.showCompose.set(false);
                    this.load();
                },
                error: (err) => this.snack.open(err?.error?.message ?? "Erreur lors de l'envoi", 'OK', { duration: 3000 })
            });
        }
        markRead(m) {
            this.social.markMessageRead(m.id).subscribe({
                next: () => this.allMessages.update(list => list.map(msg => msg.id === m.id ? { ...msg, lu_at: new Date().toISOString() } : msg))
            });
        }
        remove(m) {
            if (!confirm('Supprimer ce message ?'))
                return;
            this.social.deleteMessage(m.id).subscribe({
                next: () => {
                    this.allMessages.update(list => list.filter(msg => msg.id !== m.id));
                    this.snack.open('Message supprime', 'OK', { duration: 1500 });
                }
            });
        }
        replyTo(m) {
            this.recipient.set({
                id: m.expediteur_id,
                nom: m.expediteur_nom ?? '',
                prenom: m.expediteur_prenom ?? '',
                email: ''
            });
            this.compose.sujet = m.sujet ? `Re: ${m.sujet}` : '';
            this.showCompose.set(true);
            this.expandedId.set(null);
        }
    };
    return AdminMessagesComponent = _classThis;
})();
export { AdminMessagesComponent };
