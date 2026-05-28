import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { SocialService, ContactUser } from '@core/services/social.service';
import { AuthService } from '@core/services/auth.service';
import { Message } from '@core/models';

type FilterType = 'all' | 'unread' | 'inbox' | 'sent';

interface CourseOption { id: number; titre: string; students: ContactUser[] }

interface Conversation {
  contactId: number;
  contactPrenom: string;
  contactNom: string;
  contactEmail: string;
  messages: Message[];       // triés du plus ancien au plus récent
  lastMessage: Message;
  unreadCount: number;
  hasSent: boolean;          // j'ai envoyé au moins un message
  hasReceived: boolean;      // j'ai reçu au moins un message
}

@Component({
  selector: 'app-messages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatAutocompleteModule, MatTooltipModule
  ],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-8 space-y-4">

      <!-- En-tête -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark flex items-center gap-2">
            <mat-icon class="text-edaara-primary">forum</mat-icon>
            Messagerie
          </h1>
          <p class="text-slate-500 text-sm">
            {{ conversations().length }} conversation{{ conversations().length > 1 ? 's' : '' }}
            @if (unreadCount() > 0) {
              &middot; <span class="text-edaara-primary font-semibold">{{ unreadCount() }} non lu{{ unreadCount() > 1 ? 's' : '' }}</span>
            }
          </p>
        </div>
        <button mat-flat-button color="primary" (click)="toggleCompose()">
          <mat-icon>edit</mat-icon> Nouveau message
        </button>
      </header>

      <!-- ═══════════════════ FORMULAIRE COMPOSITION ═══════════════════ -->
      @if (showCompose()) {
        <div class="bg-white rounded-xl shadow-sm border border-edaara-primary/30 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-edaara-dark">Nouveau message</h3>
            <button mat-icon-button (click)="toggleCompose()"><mat-icon>close</mat-icon></button>
          </div>

          <!-- Chargement contacts -->
          @if (contactsLoading()) {
            <div class="flex items-center gap-2 text-slate-500 text-sm py-2">
              <span class="inline-block w-4 h-4 border-2 border-edaara-primary border-t-transparent rounded-full animate-spin"></span>
              Chargement des contacts…
            </div>
          }

          <!-- ── INSTRUCTOR ── -->
          @if (isInstructor() && !contactsLoading()) {
            <div class="space-y-3">
              <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Envoyer à</p>
              <div class="flex gap-2 flex-wrap">
                <button type="button"
                        class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
                        [class.bg-edaara-primary]="targetType() === 'admin'"
                        [class.text-white]="targetType() === 'admin'"
                        [class.border-edaara-primary]="targetType() === 'admin'"
                        [class.shadow-md]="targetType() === 'admin'"
                        [class.bg-white]="targetType() !== 'admin'"
                        [class.text-slate-600]="targetType() !== 'admin'"
                        [class.border-slate-300]="targetType() !== 'admin'"
                        (click)="setTargetType('admin')">
                  <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">admin_panel_settings</mat-icon>
                  Admin
                </button>
                <button type="button"
                        class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
                        [class.bg-edaara-primary]="targetType() === 'student'"
                        [class.text-white]="targetType() === 'student'"
                        [class.border-edaara-primary]="targetType() === 'student'"
                        [class.shadow-md]="targetType() === 'student'"
                        [class.bg-white]="targetType() !== 'student'"
                        [class.text-slate-600]="targetType() !== 'student'"
                        [class.border-slate-300]="targetType() !== 'student'"
                        (click)="setTargetType('student')">
                  <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">school</mat-icon>
                  Étudiant d'un cours
                </button>
              </div>

              @if (targetType() === 'admin') {
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <mat-label>Choisir un administrateur</mat-label>
                  <mat-icon matPrefix>admin_panel_settings</mat-icon>
                  <mat-select [value]="selectedAdminValue()" [compareWith]="compareFn"
                              (selectionChange)="onAdminSelect($event.value)">
                    @for (u of contacts().admins; track u.id) {
                      <mat-option [value]="u">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full bg-edaara-primary/20 text-edaara-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{{ initials(u) }}</div>
                          <span class="font-medium">{{ u.prenom }} {{ u.nom }}</span>
                          <span class="text-xs text-slate-400 truncate">{{ u.email }}</span>
                        </div>
                      </mat-option>
                    }
                    @if (!contacts().admins.length) { <mat-option disabled>Aucun administrateur</mat-option> }
                  </mat-select>
                </mat-form-field>
              }

              @if (targetType() === 'student') {
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <mat-label>Filtrer par cours</mat-label>
                  <mat-icon matPrefix>book</mat-icon>
                  <mat-select [value]="selectedCourse()" [compareWith]="compareFn"
                              (selectionChange)="selectCourse($event.value)">
                    @for (c of contacts().courses; track c.id) {
                      <mat-option [value]="c">{{ c.titre }}</mat-option>
                    }
                    @if (!contacts().courses?.length) { <mat-option disabled>Aucun cours</mat-option> }
                  </mat-select>
                </mat-form-field>

                @if (selectedCourse()) {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                    <mat-label>Choisir un étudiant</mat-label>
                    <mat-icon matPrefix>person</mat-icon>
                    <mat-select [value]="selectedStudentValue()" [compareWith]="compareFn"
                                (selectionChange)="onStudentSelect($event.value)">
                      @for (u of selectedCourse()!.students; track u.id) {
                        <mat-option [value]="u">
                          <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-edaara-primary/20 text-edaara-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{{ initials(u) }}</div>
                            <span class="font-medium">{{ u.prenom }} {{ u.nom }}</span>
                            <span class="text-xs text-slate-400 truncate">{{ u.email }}</span>
                          </div>
                        </mat-option>
                      }
                      @if (!selectedCourse()!.students.length) { <mat-option disabled>Aucun étudiant inscrit</mat-option> }
                    </mat-select>
                  </mat-form-field>
                }
              }
            </div>
          }

          <!-- ── STUDENT ── -->
          @if (isStudent() && !contactsLoading()) {
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
              <mat-label>Destinataire</mat-label>
              <mat-icon matPrefix>person_search</mat-icon>
              <mat-select [value]="selectedStudentValue()" [compareWith]="compareFn"
                          (selectionChange)="onStudentSelect($event.value)">
                @if (contacts().admins.length) {
                  <mat-optgroup label="Administrateurs">
                    @for (u of contacts().admins; track u.id) {
                      <mat-option [value]="u">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full bg-edaara-primary/20 text-edaara-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{{ initials(u) }}</div>
                          <span class="font-medium">{{ u.prenom }} {{ u.nom }}</span>
                          <span class="text-xs text-slate-400 truncate">{{ u.email }}</span>
                        </div>
                      </mat-option>
                    }
                  </mat-optgroup>
                }
                @if (contacts().instructors?.length) {
                  <mat-optgroup label="Mes formateurs">
                    @for (u of contacts().instructors!; track u.id) {
                      <mat-option [value]="u">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full bg-edaara-primary/20 text-edaara-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{{ initials(u) }}</div>
                          <span class="font-medium">{{ u.prenom }} {{ u.nom }}</span>
                          <span class="text-xs text-slate-400 truncate">{{ u.email }}</span>
                        </div>
                      </mat-option>
                    }
                  </mat-optgroup>
                }
              </mat-select>
            </mat-form-field>
          }

          <!-- ── ADMIN : autocomplete libre ── -->
          @if (isAdmin()) {
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
              <mat-label>Destinataire</mat-label>
              <mat-icon matPrefix>person_search</mat-icon>
              <input matInput type="text" placeholder="Tapez un nom ou email…"
                     [formControl]="searchCtrl" [matAutocomplete]="auto" />
              <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayUser"
                                (optionSelected)="selectRecipient($event.option.value)">
                @for (u of suggestions(); track u.id) {
                  <mat-option [value]="u">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-edaara-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{{ initials(u) }}</div>
                      <span class="font-medium">{{ u.prenom }} {{ u.nom }}</span>
                      <span class="text-xs text-slate-400 ml-1">{{ u.email }}</span>
                    </div>
                  </mat-option>
                }
                @if (suggestions().length === 0 && searchCtrl.value && searchCtrl.value.length >= 2) {
                  <mat-option disabled>Aucun utilisateur trouvé</mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>
          }

          <!-- Destinataire sélectionné -->
          @if (recipient()) {
            <div class="flex items-center gap-3 bg-edaara-primary/5 rounded-lg px-3 py-2">
              <div class="w-8 h-8 rounded-full bg-edaara-primary text-white flex items-center justify-center text-sm font-bold">{{ initials(recipient()!) }}</div>
              <div class="flex-1 text-sm">
                <span class="font-medium">{{ recipient()!.prenom }} {{ recipient()!.nom }}</span>
                @if (recipient()!.email) { <span class="text-slate-400 ml-2">{{ recipient()!.email }}</span> }
              </div>
              <button mat-icon-button (click)="clearRecipient()"><mat-icon class="!text-slate-400">cancel</mat-icon></button>
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

      <!-- ═══════════════════ BARRE RECHERCHE ═══════════════════ -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 px-4 py-3 flex gap-3 items-center">
        <mat-icon class="text-slate-400 flex-shrink-0">search</mat-icon>
        <input type="text" [value]="searchText()"
               (input)="searchText.set($any($event.target).value)"
               placeholder="Rechercher une conversation, un sujet, un contenu…"
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

      <!-- ═══════════════════ FILTRES ═══════════════════ -->
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

      <!-- ═══════════════════ CONVERSATIONS ═══════════════════ -->
      @if (filteredConversations().length === 0) {
        <div class="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
          <mat-icon class="!text-5xl text-slate-300">{{ searchText() ? 'search_off' : 'forum' }}</mat-icon>
          <p class="text-slate-500 mt-3">
            {{ searchText() ? 'Aucun résultat pour "' + searchText() + '"' : 'Aucune conversation' }}
          </p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (conv of filteredConversations(); track conv.contactId) {
            <article class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-shadow hover:shadow-md"
                     [class.border-l-4]="conv.unreadCount > 0"
                     [class.border-l-edaara-primary]="conv.unreadCount > 0">

              <!-- En-tête conversation (cliquable) -->
              <div class="p-4 cursor-pointer flex items-start gap-3" (click)="expandConv(conv)">
                <div class="w-10 h-10 rounded-full bg-edaara-primary/15 text-edaara-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {{ convInitials(conv) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="font-semibold text-edaara-dark text-sm">
                        {{ conv.contactPrenom }} {{ conv.contactNom }}
                        @if (conv.unreadCount > 0) {
                          <span class="ml-2 px-2 py-0.5 bg-edaara-primary text-white rounded-full text-xs align-middle">
                            {{ conv.unreadCount }} nouveau{{ conv.unreadCount > 1 ? 'x' : '' }}
                          </span>
                        }
                      </p>
                      <p class="text-xs text-slate-400">{{ conv.contactEmail }}</p>
                      <p class="text-sm text-slate-500 truncate mt-0.5">
                        @if (isSentByMe(conv.lastMessage)) {
                          <span class="text-slate-400 text-xs">Vous : </span>
                        }
                        {{ conv.lastMessage.corps || conv.lastMessage.contenu }}
                      </p>
                    </div>
                    <div class="flex flex-col items-end gap-1 flex-shrink-0">
                      <span class="text-xs text-slate-400">{{ conv.lastMessage.created_at | date:'dd/MM HH:mm' }}</span>
                      <span class="text-xs text-slate-400">{{ conv.messages.length }} msg{{ conv.messages.length > 1 ? 's' : '' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Vue chat dépliée -->
              @if (expandedContactId() === conv.contactId) {
                <div class="border-t border-slate-100">
                  <!-- Bulles de messages -->
                  <div class="p-4 space-y-3 max-h-80 overflow-y-auto bg-slate-50/50">
                    @for (m of conv.messages; track m.id) {
                      <div class="flex" [class.justify-end]="isSentByMe(m)">
                        @if (!isSentByMe(m)) {
                          <div class="w-7 h-7 rounded-full bg-edaara-primary/20 text-edaara-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mr-2 mt-1">
                            {{ convInitials(conv) }}
                          </div>
                        }
                        <div class="max-w-xs lg:max-w-md rounded-2xl px-3 py-2 text-sm"
                             [class.bg-edaara-primary]="isSentByMe(m)"
                             [class.text-white]="isSentByMe(m)"
                             [class.rounded-tr-none]="isSentByMe(m)"
                             [class.bg-white]="!isSentByMe(m)"
                             [class.border]="!isSentByMe(m)"
                             [class.border-slate-200]="!isSentByMe(m)"
                             [class.rounded-tl-none]="!isSentByMe(m)">
                          @if (m.sujet) {
                            <p class="text-xs font-semibold mb-1 opacity-75">{{ m.sujet }}</p>
                          }
                          <p class="whitespace-pre-wrap leading-relaxed">{{ m.corps || m.contenu }}</p>
                          <p class="text-xs mt-1 text-right"
                             [class.opacity-60]="isSentByMe(m)"
                             [class.text-slate-400]="!isSentByMe(m)">
                            {{ m.created_at | date:'dd/MM HH:mm' }}
                          </p>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="px-4 py-3 border-t border-slate-100 flex justify-between items-center bg-white">
                    <button mat-icon-button class="!text-red-400" (click)="removeConv(conv)" matTooltip="Supprimer la conversation">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                    <button mat-flat-button color="primary" (click)="replyToConv(conv)">
                      <mat-icon>reply</mat-icon> Répondre
                    </button>
                  </div>
                </div>
              }
            </article>
          }
        </div>
      }
    </div>
  `
})
export class MessagesComponent implements OnInit {
  private readonly social  = inject(SocialService);
  private readonly auth    = inject(AuthService);
  private readonly snack   = inject(MatSnackBar);

  // ── Rôle ──────────────────────────────────────────────────────────────────
  protected readonly isAdmin      = computed(() => this.auth.roles().includes('admin'));
  protected readonly isInstructor = computed(() => this.auth.roles().includes('instructor'));
  protected readonly isStudent    = computed(() => this.auth.roles().includes('student'));

  // ── Messages bruts ────────────────────────────────────────────────────────
  protected readonly inboxMessages = signal<Message[]>([]);
  protected readonly sentMessages  = signal<Message[]>([]);

  private readonly allMessages = computed<Message[]>(() => {
    const seen = new Set<number>();
    return [...this.inboxMessages(), ...this.sentMessages()]
      .filter(m => { const ok = !seen.has(m.id); seen.add(m.id); return ok; });
  });

  // ── Conversations regroupées par contact ──────────────────────────────────
  protected readonly conversations = computed<Conversation[]>(() => {
    const myId = this.auth.currentUser()?.id;
    const map  = new Map<number, Conversation>();

    for (const m of this.allMessages()) {
      const fromMe     = m.expediteur_id === myId;
      const contactId  = fromMe ? m.destinataire_id : m.expediteur_id;
      const cPrenom    = fromMe ? (m.destinataire_prenom ?? '') : (m.expediteur_prenom ?? '');
      const cNom       = fromMe ? (m.destinataire_nom    ?? '') : (m.expediteur_nom    ?? '');
      const cEmail     = fromMe ? (m.destinataire_email  ?? '') : (m.expediteur_email  ?? '');

      if (!map.has(contactId)) {
        map.set(contactId, {
          contactId, contactPrenom: cPrenom, contactNom: cNom,
          contactEmail: cEmail, messages: [],
          lastMessage: m, unreadCount: 0,
          hasSent: false, hasReceived: false
        });
      }
      const conv = map.get(contactId)!;
      conv.messages.push(m);

      if (new Date(m.created_at) > new Date(conv.lastMessage.created_at)) {
        conv.lastMessage = m;
      }
      if (!fromMe && !m.lu_at) conv.unreadCount++;
      if (fromMe)  conv.hasSent     = true;
      else         conv.hasReceived = true;
    }

    for (const conv of map.values()) {
      conv.messages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    return Array.from(map.values())
      .sort((a, b) =>
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
  });

  protected readonly expandedContactId = signal<number | null>(null);
  protected readonly activeFilter      = signal<FilterType>('all');
  protected readonly searchText        = signal('');

  protected readonly unreadCount = computed(
    () => this.conversations().reduce((s, c) => s + c.unreadCount, 0)
  );

  protected readonly filteredConversations = computed<Conversation[]>(() => {
    let list = this.conversations();
    switch (this.activeFilter()) {
      case 'unread': list = list.filter(c => c.unreadCount > 0); break;
      case 'inbox':  list = list.filter(c => c.hasReceived); break;
      case 'sent':   list = list.filter(c => c.hasSent); break;
    }
    const q = this.searchText().trim().toLowerCase();
    if (!q) return list;
    return list.filter(c =>
      c.contactNom.toLowerCase().includes(q) ||
      c.contactPrenom.toLowerCase().includes(q) ||
      c.messages.some(m =>
        (m.sujet  ?? '').toLowerCase().includes(q) ||
        (m.corps  ?? '').toLowerCase().includes(q) ||
        (m.contenu ?? '').toLowerCase().includes(q)
      )
    );
  });

  protected readonly filters: Array<{ value: FilterType; label: string; icon: string }> = [
    { value: 'all',    label: 'Toutes',   icon: 'all_inbox'         },
    { value: 'unread', label: 'Non lus',  icon: 'mark_email_unread' },
    { value: 'inbox',  label: 'Reçus',    icon: 'inbox'             },
    { value: 'sent',   label: 'Envoyés',  icon: 'send'              }
  ];

  // ── Compose ───────────────────────────────────────────────────────────────
  protected readonly showCompose          = signal(false);
  protected readonly recipient            = signal<ContactUser | null>(null);
  protected readonly targetType           = signal<'admin' | 'student'>('admin');
  protected readonly selectedCourse       = signal<CourseOption | null>(null);
  protected readonly selectedAdminValue   = signal<ContactUser | null>(null);
  protected readonly selectedStudentValue = signal<ContactUser | null>(null);

  protected newMsg = { sujet: '', contenu: '' };

  protected readonly contacts = signal<{
    admins: ContactUser[];
    courses?: CourseOption[];
    instructors?: ContactUser[];
  }>({ admins: [], courses: [], instructors: [] });

  private contactsLoaded = false;
  protected readonly contactsLoading = signal(false);

  protected readonly suggestions = signal<ContactUser[]>([]);
  protected readonly searchCtrl  = new FormControl('');

  protected readonly compareFn = (a: any, b: any) =>
    a != null && b != null && a.id === b.id;

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged(),
      switchMap(v => {
        if (!this.isAdmin()) return of(null);
        const q = typeof v === 'string' ? v.trim() : '';
        if (q.length < 2) { this.suggestions.set([]); return of(null); }
        return this.social.searchUsers(q);
      })
    ).subscribe(res => {
      if (res) this.suggestions.set(res.data?.users ?? []);
    });
  }

  // ── Chargement ────────────────────────────────────────────────────────────
  load(): void {
    this.social.listMessages('inbox').subscribe({
      next: (res) => this.inboxMessages.set(res.data?.messages ?? [])
    });
    this.social.listMessages('sent').subscribe({
      next: (res) => this.sentMessages.set(res.data?.messages ?? [])
    });
  }

  // ── Conversations ─────────────────────────────────────────────────────────
  expandConv(conv: Conversation): void {
    const same = this.expandedContactId() === conv.contactId;
    this.expandedContactId.set(same ? null : conv.contactId);
    if (!same && conv.unreadCount > 0) this.markConvRead(conv);
  }

  markConvRead(conv: Conversation): void {
    const unread = conv.messages.filter(m => !m.lu_at && !this.isSentByMe(m));
    unread.forEach(m => {
      this.social.markMessageRead(m.id).subscribe({
        next: () => this.inboxMessages.update(list =>
          list.map(msg => msg.id === m.id ? { ...msg, lu_at: new Date().toISOString() } : msg)
        )
      });
    });
  }

  removeConv(conv: Conversation): void {
    const ids = conv.messages.map(m => m.id);
    let done = 0;
    ids.forEach(id => {
      this.social.deleteMessage(id).subscribe({
        next: () => {
          done++;
          if (done === ids.length) {
            this.inboxMessages.update(l => l.filter(m => !ids.includes(m.id)));
            this.sentMessages.update(l => l.filter(m => !ids.includes(m.id)));
            this.expandedContactId.set(null);
            this.snack.open('Conversation supprimée', 'OK', { duration: 1500 });
          }
        }
      });
    });
  }

  replyToConv(conv: Conversation): void {
    this.recipient.set({
      id: conv.contactId,
      prenom: conv.contactPrenom,
      nom: conv.contactNom,
      email: conv.contactEmail
    });
    this.newMsg.sujet = '';
    this.showCompose.set(true);
    this.expandedContactId.set(null);
  }

  // ── Compose ───────────────────────────────────────────────────────────────
  toggleCompose(): void {
    this.showCompose.update(v => !v);
    if (!this.showCompose()) {
      this.resetCompose();
    } else if (!this.isAdmin() && !this.contactsLoaded) {
      this.contactsLoading.set(true);
      this.social.getContacts().subscribe({
        next: (res) => {
          this.contacts.set(res.data ?? { admins: [] });
          this.contactsLoaded = true;
          this.contactsLoading.set(false);
        },
        error: (err) => {
          this.contactsLoading.set(false);
          const msg = err?.error?.message
            || (typeof err?.error === 'string' ? err.error : null)
            || `Erreur ${err?.status ?? 'réseau'} au chargement des contacts`;
          this.snack.open(msg, 'OK', { duration: 6000 });
        }
      });
    }
  }

  resetCompose(): void {
    this.newMsg = { sujet: '', contenu: '' };
    this.recipient.set(null);
    this.targetType.set('admin');
    this.selectedCourse.set(null);
    this.selectedAdminValue.set(null);
    this.selectedStudentValue.set(null);
    this.searchCtrl.setValue('', { emitEvent: false });
    this.suggestions.set([]);
  }

  setTargetType(t: 'admin' | 'student'): void {
    this.targetType.set(t);
    this.recipient.set(null);
    this.selectedCourse.set(null);
    this.selectedAdminValue.set(null);
    this.selectedStudentValue.set(null);
  }

  selectCourse(c: CourseOption): void {
    this.selectedCourse.set(c);
    this.recipient.set(null);
    this.selectedStudentValue.set(null);
  }

  onAdminSelect(u: ContactUser): void   { this.selectedAdminValue.set(u);   this.recipient.set(u); }
  onStudentSelect(u: ContactUser): void { this.selectedStudentValue.set(u); this.recipient.set(u); }

  selectRecipient(u: ContactUser): void {
    this.recipient.set(u);
    this.searchCtrl.setValue('', { emitEvent: false });
    this.suggestions.set([]);
  }

  clearRecipient(): void {
    this.recipient.set(null);
    this.selectedAdminValue.set(null);
    this.selectedStudentValue.set(null);
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
        this.load();
      },
      error: (err) => this.snack.open(err?.error?.message ?? "Erreur lors de l'envoi", 'OK', { duration: 3000 })
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isSentByMe(m: Message): boolean {
    return m.expediteur_id === this.auth.currentUser()?.id;
  }

  initials(u: ContactUser): string {
    return (u.prenom.charAt(0) + u.nom.charAt(0)).toUpperCase();
  }

  convInitials(c: Conversation): string {
    return (c.contactPrenom.charAt(0) + c.contactNom.charAt(0)).toUpperCase();
  }

  displayUser(u: ContactUser | string | null): string {
    if (!u || typeof u === 'string') return typeof u === 'string' ? u : '';
    return `${u.prenom} ${u.nom}`;
  }
}