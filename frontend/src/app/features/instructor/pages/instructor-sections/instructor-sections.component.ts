import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ElementRef, OnInit, ViewChild, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '@core/services/course.service';
import { MediaService } from '@core/services/media.service';
import { Lesson, Resource, Section } from '@core/models';

// ── Constantes de validation fichiers ──────────────────────────────────────────
const ACCEPT_MAP: Record<string, string> = {
  video: 'video/mp4,video/webm,video/ogg,video/avi,video/quicktime',
  pdf:   'application/pdf,.pdf',
  audio: 'audio/mpeg,audio/ogg,audio/wav,audio/aac',
  image: 'image/jpeg,image/png,image/webp,image/gif',
  lien:  '',
  autre: '',
  projet: 'application/pdf,.pdf'
};
const MIME_ALLOWED: Record<string, string[]> = {
  video: ['video/mp4','video/webm','video/ogg','video/avi','video/quicktime'],
  pdf:   ['application/pdf'],
  audio: ['audio/mpeg','audio/ogg','audio/wav','audio/aac','audio/mp4','audio/x-m4a'],
  image: ['image/jpeg','image/png','image/webp','image/gif'],
  projet: ['application/pdf'],
};
const ACCEPT_HINT: Record<string, string> = {
  video: 'MP4, WebM, OGG',
  pdf:   'PDF uniquement',
  audio: 'MP3, OGG, WAV',
  image: 'JPEG, PNG, WebP, GIF',
  lien:  '',
  autre: 'Tout type de fichier autorisé',
  projet: 'PDF (projet)'
};

interface NewLessonForm {
  titre:            string;
  duree:            number;
  thumbnailUrl:     string;
  thumbnailName:    string;
  thumbnailPreview: string | null;
  uploading:        boolean;
}
interface NewResForm {
  titre:       string;
  type:        string;
  url:         string;
  contenu:     string;
  uploading:   boolean;
  fileName:    string;
  filePreview: string | null;
}
interface DeleteTarget {
  kind:      'section' | 'lesson';
  label:     string;
  sectionId: number;
  lesson?:   Lesson;
}

@Component({
  selector: 'app-instructor-sections',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatExpansionModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatProgressBarModule
  ],
  template: `
    <!-- Inputs fichier cachés (partagés) -->
    <input #thumbInput type="file" accept="image/jpeg,image/png,image/webp,image/gif"
           class="hidden" (change)="onThumbSelected($event)" />
    <input #resInput type="file" class="hidden" (change)="onResFileSelected($event)" />

    <div class="space-y-4">

      <!-- En-tête -->
      <header class="flex items-center gap-3">
        <a mat-icon-button routerLink="/instructor/paths" aria-label="Retour">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-edaara-dark">Sections & leçons</h1>
          <p class="text-slate-500 text-sm">Organisez votre cours en sections et leçons</p>
        </div>
      </header>

      <!-- Formulaire nouvelle section -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h3 class="font-semibold mb-3 text-edaara-dark text-sm">Ajouter une section</h3>
        <div class="flex gap-2">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
            <mat-label>Titre de la section</mat-label>
            <mat-icon matPrefix>folder_open</mat-icon>
            <input matInput [(ngModel)]="newSectionTitle"
                   placeholder="Ex : Introduction, Bases, Projet final…"
                   (keydown.enter)="addSection()" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="addSection()"
                  [disabled]="!newSectionTitle.trim()">
            <mat-icon>add</mat-icon> Ajouter
          </button>
        </div>
      </div>

      <!-- Accordéon sections -->
      <mat-accordion multi>
        @for (s of sections(); track s.id) {
          <mat-expansion-panel class="!rounded-xl !shadow-sm !border !border-slate-100 !mb-2">
            <mat-expansion-panel-header>
              <mat-panel-title class="font-semibold text-edaara-dark">
                <mat-icon class="!text-slate-400 mr-2 !text-base">folder_open</mat-icon>
                {{ s.ordre }}. {{ s.titre }}
              </mat-panel-title>
              <mat-panel-description>
                {{ (lessonsBySection()[s.id] || []).length }} leçon(s)
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="space-y-3 pt-2">

              <!-- ── Leçons existantes ── -->
              @for (l of lessonsBySection()[s.id] || []; track l.id) {
                <div class="border border-slate-200 rounded-xl overflow-hidden">

                  <!-- Ligne leçon -->
                  <div class="flex items-center gap-2 px-3 py-2.5 bg-slate-50">
                    @if (l.thumbnail) {
                      <img [src]="l.thumbnail" class="w-8 h-8 object-cover rounded flex-shrink-0" />
                    } @else {
                      <mat-icon class="!text-base text-slate-400 flex-shrink-0">play_lesson</mat-icon>
                    }
                    <span class="flex-1 text-sm font-medium text-edaara-dark">{{ l.ordre }}. {{ l.titre }}</span>
                    @if (l.duree) {
                      <span class="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">
                        {{ l.duree }} min
                      </span>
                    }
                    <!-- Bouton ressources avec badge compteur -->
                    <button mat-stroked-button class="!text-xs !py-1 !px-2 !min-w-0 flex-shrink-0 gap-1"
                            (click)="toggleResources(l.id)">
                      <mat-icon class="!text-sm">{{ expandedLesson() === l.id ? 'expand_less' : 'attach_file' }}</mat-icon>
                      Ressources
                      @if ((resourcesByLesson()[l.id] || []).length > 0) {
                        <span class="bg-edaara-primary text-white rounded-full px-1.5 text-xs font-bold leading-4">
                          {{ (resourcesByLesson()[l.id] || []).length }}
                        </span>
                      }
                    </button>
                    <button mat-icon-button (click)="askDeleteLesson(l, s.id)" matTooltip="Supprimer la leçon">
                      <mat-icon class="!text-base !text-red-400">delete</mat-icon>
                    </button>
                  </div>

                  <!-- Panneau ressources (dépliable) -->
                  @if (expandedLesson() === l.id) {
                    <div class="border-t border-slate-100 bg-white p-4 space-y-4">

                      <!-- Liste des ressources -->
                      <div class="space-y-2">
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Ressources complémentaires
                        </p>

                        @for (r of resourcesByLesson()[l.id] || []; track r.id) {
                          <div class="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            @if (r.type === 'image' && r.url) {
                              <img [src]="r.url" [alt]="r.titre"
                                   class="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                            } @else {
                              <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                   [ngClass]="resIconBg(r.type)">
                                <mat-icon class="!text-base" [ngClass]="resIconColor(r.type)">
                                  {{ resIcon(r.type) }}
                                </mat-icon>
                              </div>
                            }
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-edaara-dark truncate">{{ r.titre }}</p>
                              <div class="flex items-center gap-2 mt-0.5">
                                <span class="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                  {{ r.type }}
                                </span>
                                @if (r.url) {
                                  <a [href]="r.url" target="_blank"
                                     class="text-xs text-blue-500 hover:underline">Ouvrir ↗</a>
                                }
                              </div>
                            </div>
                            <button mat-icon-button (click)="removeResource(r, l.id)"
                                    matTooltip="Supprimer la ressource">
                              <mat-icon class="!text-sm !text-red-400">close</mat-icon>
                            </button>
                          </div>
                        } @empty {
                          <p class="text-xs text-slate-400 italic">
                            Aucune ressource. Ajoutez-en une ci-dessous.
                          </p>
                        }
                      </div>

                      <!-- Formulaire ajout ressource -->
                      <div class="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/60 space-y-3">
                        <p class="text-xs font-semibold text-slate-600">Ajouter une ressource</p>

                        <div class="grid sm:grid-cols-2 gap-2">
                          <mat-form-field appearance="outline" subscriptSizing="dynamic">
                            <mat-label>Titre *</mat-label>
                            <input matInput [ngModel]="getNewRes(l.id).titre"
                                   (ngModelChange)="getNewRes(l.id).titre=$event"
                                   placeholder="Support de cours, Exercice…" />
                          </mat-form-field>
                          <mat-form-field appearance="outline" subscriptSizing="dynamic">
                            <mat-label>Type</mat-label>
                            <mat-select [ngModel]="getNewRes(l.id).type"
                                        (ngModelChange)="onResTypeChange(l.id, $event)">
                              <mat-option value="video">📹 Vidéo</mat-option>
                              <mat-option value="pdf">📄 PDF</mat-option>
                              <mat-option value="audio">🎵 Audio</mat-option>
                              <mat-option value="image">🖼️ Image</mat-option>
                              <mat-option value="lien">🔗 Lien externe</mat-option>
                              <mat-option value="texte">✍️ Texte</mat-option>
                              <mat-option value="projet">📁 Projet (PDF)</mat-option>
                              <mat-option value="autre">📎 Autre</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                        @if (getNewRes(l.id).type === 'texte') {
                          <div class="w-full">
                            <p class="text-xs text-slate-500 mb-2">Mise en forme : <small class="text-slate-400">Sélectionnez du texte puis cliquez</small></p>
                            <div class="flex gap-1 mb-2">
                              <button mat-stroked-button type="button" class="!text-xs" (click)="applyFormat($event, 'bold', l.id)"><mat-icon>format_bold</mat-icon></button>
                              <button mat-stroked-button type="button" class="!text-xs" (click)="applyFormat($event, 'italic', l.id)"><mat-icon>format_italic</mat-icon></button>
                              <button mat-stroked-button type="button" class="!text-xs" (click)="applyFormat($event, 'underline', l.id)"><mat-icon>format_underlined</mat-icon></button>
                              <button mat-stroked-button type="button" class="!text-xs" (click)="applyFormat($event, 'insertUnorderedList', l.id)"><mat-icon>format_list_bulleted</mat-icon></button>
                              <button mat-stroked-button type="button" class="!text-xs" (click)="applyFormat($event, 'insertOrderedList', l.id)"><mat-icon>format_list_numbered</mat-icon></button>
                              <button mat-stroked-button type="button" class="!text-xs" (click)="applyLink(l.id)"><mat-icon>link</mat-icon></button>
                              <button mat-stroked-button type="button" class="!text-xs" (click)="applyFormat($event, 'removeFormat', l.id)"><mat-icon>format_clear</mat-icon></button>
                            </div>
                            <div class="border rounded-lg p-3 bg-white min-h-[120px] prose max-w-full" contenteditable="true"
                                 (input)="onRichInput($event, l.id)"
                                 [attr.aria-label]="'Editeur texte leçon ' + l.id"></div>
                          </div>
                        } @else if (getNewRes(l.id).type === 'lien') {
                          <!-- Lien externe : champ URL -->
                          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                            <mat-label>URL *</mat-label>
                            <mat-icon matPrefix>link</mat-icon>
                            <input matInput [ngModel]="getNewRes(l.id).url"
                                   (ngModelChange)="getNewRes(l.id).url=$event"
                                   placeholder="https://…" />
                          </mat-form-field>
                        } @else {
                          @if (getNewRes(l.id).url) {
                            <!-- Fichier uploadé : aperçu + nom -->
                            <div class="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                              @if (getNewRes(l.id).type === 'image' && getNewRes(l.id).filePreview) {
                                <img [src]="getNewRes(l.id).filePreview!"
                                     class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                              } @else {
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 flex-shrink-0">
                                  <mat-icon class="text-green-600">{{ resIcon(getNewRes(l.id).type) }}</mat-icon>
                                </div>
                              }
                              <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-green-700 truncate">
                                  {{ getNewRes(l.id).fileName || 'Fichier uploadé' }}
                                </p>
                                <p class="text-xs text-green-600">Prêt à ajouter</p>
                              </div>
                              <button mat-icon-button (click)="clearResFile(l.id)">
                                <mat-icon class="!text-sm text-slate-400">close</mat-icon>
                              </button>
                            </div>
                          } @else {
                            <!-- Bouton upload -->
                            <div class="flex items-center gap-3 flex-wrap">
                              <button mat-stroked-button type="button"
                                      [disabled]="getNewRes(l.id).uploading"
                                      (click)="triggerResUpload(l.id)">
                                <mat-icon>upload_file</mat-icon>
                                {{ getNewRes(l.id).uploading ? 'Upload en cours…' : 'Choisir un fichier' }}
                              </button>
                              @if (getNewRes(l.id).uploading) {
                                <mat-progress-bar mode="indeterminate"
                                                  class="flex-1 !h-1 rounded min-w-16"></mat-progress-bar>
                              }
                              @if (acceptHint(getNewRes(l.id).type)) {
                                <span class="text-xs text-slate-400">
                                  {{ acceptHint(getNewRes(l.id).type) }}
                                </span>
                              }
                            </div>
                          }
                        }

                        <div class="flex justify-end pt-1">
                          <button mat-flat-button color="accent"
                                  [disabled]="!canAddResource(l.id)"
                                  (click)="addResource(l.id)">
                            <mat-icon>add</mat-icon> Ajouter la ressource
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @empty {
                <p class="text-sm text-slate-400 italic text-center py-3">
                  Aucune leçon dans cette section.
                </p>
              }

              <!-- ── Formulaire ajout leçon (simplifié) ── -->
              <div class="bg-blue-50/50 rounded-xl p-4 space-y-3 border border-blue-100">
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <mat-icon class="!text-sm text-edaara-primary">add_circle</mat-icon>
                  Nouvelle leçon
                </p>

                <div class="grid sm:grid-cols-3 gap-2">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-2">
                    <mat-label>Titre *</mat-label>
                    <input matInput [ngModel]="getNewLesson(s.id).titre"
                           (ngModelChange)="getNewLesson(s.id).titre=$event"
                           placeholder="Ex : Introduction à HTML" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Durée (min)</mat-label>
                    <mat-icon matPrefix>schedule</mat-icon>
                    <input matInput type="number" min="0" max="999"
                           [ngModel]="getNewLesson(s.id).duree"
                           (ngModelChange)="getNewLesson(s.id).duree=+$event" />
                  </mat-form-field>
                </div>

                <!-- Image de la leçon (optionnelle) -->
                <div>
                  <p class="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                    <mat-icon class="!text-xs">image</mat-icon>
                    Image d'illustration — optionnelle, affichée dans le parcours
                  </p>
                  @if (getNewLesson(s.id).thumbnailUrl) {
                    <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 w-fit">
                      <img [src]="getNewLesson(s.id).thumbnailPreview || getNewLesson(s.id).thumbnailUrl"
                           class="w-16 h-10 object-cover rounded-lg flex-shrink-0" />
                      <p class="text-sm text-slate-700 truncate max-w-48">
                        {{ getNewLesson(s.id).thumbnailName || 'Image' }}
                      </p>
                      <button mat-icon-button (click)="clearThumbnail(s.id)">
                        <mat-icon class="!text-sm text-slate-400">close</mat-icon>
                      </button>
                    </div>
                  } @else {
                    <button mat-stroked-button type="button" class="!text-xs"
                            [disabled]="getNewLesson(s.id).uploading"
                            (click)="triggerThumbUpload(s.id)">
                      <mat-icon>add_photo_alternate</mat-icon>
                      {{ getNewLesson(s.id).uploading ? 'Upload…' : 'Ajouter une image' }}
                    </button>
                  }
                </div>

                <div class="flex justify-end pt-1 border-t border-blue-100">
                  <button mat-flat-button color="primary"
                          [disabled]="!getNewLesson(s.id).titre.trim() || getNewLesson(s.id).uploading"
                          (click)="addLesson(s.id)">
                    <mat-icon>add</mat-icon> Ajouter la leçon
                  </button>
                </div>
              </div>

              <!-- Supprimer section -->
              <div class="flex justify-end">
                <button mat-stroked-button color="warn" (click)="askDeleteSection(s)">
                  <mat-icon>delete</mat-icon> Supprimer la section
                </button>
              </div>
            </div>
          </mat-expansion-panel>
        } @empty {
          <div class="bg-white rounded-xl p-12 text-center border border-slate-100 shadow-sm">
            <mat-icon class="!text-5xl text-slate-300">folder_open</mat-icon>
            <p class="text-slate-500 mt-3">Pas encore de section. Créez-en une ci-dessus.</p>
          </div>
        }
      </mat-accordion>
    </div>

    <!-- ══ MODALE SUPPRESSION ══ -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-red-500">warning</mat-icon>
            </div>
            <h3 class="font-semibold text-edaara-dark">
              Supprimer {{ deleteTarget()!.kind === 'section' ? 'la section' : 'la leçon' }} ?
            </h3>
          </div>
          <p class="text-sm text-slate-600">
            "<strong>{{ deleteTarget()!.label }}</strong>"
          </p>
          @if (deleteTarget()!.kind === 'section') {
            <p class="text-xs text-red-600 bg-red-50 rounded-lg p-3">
              Toutes les leçons et leurs ressources seront définitivement supprimées.
            </p>
          }
          <div class="flex gap-2 justify-end border-t border-slate-100 pt-4">
            <button mat-button (click)="deleteTarget.set(null)">Annuler</button>
            <button mat-flat-button color="warn" (click)="execDelete()">
              <mat-icon>delete</mat-icon> Supprimer
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ══ MODALE ERREUR FICHIER ══ -->
    @if (fileError()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-orange-500">block</mat-icon>
            </div>
            <h3 class="font-semibold text-orange-700">Fichier non accepté</h3>
          </div>
          <p class="text-sm text-slate-600 whitespace-pre-line">{{ fileError() }}</p>
          <div class="flex justify-end">
            <button mat-flat-button color="primary" (click)="fileError.set(null)">Compris</button>
          </div>
        </div>
      </div>
    }

    <!-- ══ MODALE AJOUT LIEN ══ -->
    @if (linkModalVisible) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
          <h3 class="font-semibold text-edaara-dark">Ajouter un lien</h3>
          <p class="text-sm text-slate-600">Collez l'URL du lien à insérer dans l'éditeur.</p>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>URL</mat-label>
            <input matInput placeholder="https://..." [(ngModel)]="linkModalUrl" />
          </mat-form-field>
          <div class="flex justify-end gap-2">
            <button mat-stroked-button (click)="cancelLink()">Annuler</button>
            <button mat-flat-button color="primary" (click)="confirmLink()">OK</button>
          </div>
        </div>
      </div>
    }
  `
})
export class InstructorSectionsComponent implements OnInit {
  @ViewChild('thumbInput') private thumbInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('resInput')   private resInputRef!:   ElementRef<HTMLInputElement>;

  private readonly route         = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly mediaService  = inject(MediaService);
  private readonly snack         = inject(MatSnackBar);
  private readonly cdr           = inject(ChangeDetectorRef);

  protected readonly courseId          = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly sections          = signal<Section[]>([]);
  protected readonly lessonsBySection  = signal<Record<number, Lesson[]>>({});
  protected readonly resourcesByLesson = signal<Record<number, Resource[]>>({});
  protected readonly expandedLesson    = signal<number | null>(null);
  protected readonly deleteTarget      = signal<DeleteTarget | null>(null);
  protected readonly fileError         = signal<string | null>(null);
  protected readonly linkModal         = signal<{ visible: boolean; url: string; lessonId: number | null }>({ visible: false, url: '', lessonId: null });

  // Helpers pour template (bindings two-way sans spread dans template)
  public get linkModalVisible(): boolean { return this.linkModal().visible; }
  public get linkModalUrl(): string { return this.linkModal().url; }
  public set linkModalUrl(v: string) { const s = this.linkModal(); this.linkModal.set({ visible: s.visible, url: v, lessonId: s.lessonId }); }
  public get linkModalLessonId(): number | null { return this.linkModal().lessonId; }

  protected newSectionTitle = '';
  protected newLesson:   Record<number, NewLessonForm> = {};
  protected newResource: Record<number, NewResForm>   = {};

  private pendingThumbSectionId: number | null = null;
  private pendingResLessonId:    number | null = null;
  private pendingResType:        string        = '';
  private savedRange: Range | null = null;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.courseService.listSections(this.courseId).subscribe({
      next: (res) => {
        const list = res.data?.sections ?? [];
        this.sections.set(list);
        list.forEach((s) => this.loadLessons(s.id));
      }
    });
  }

  loadLessons(sectionId: number): void {
    this.courseService.listLessons(sectionId).subscribe({
      next: (res) => this.lessonsBySection.update(m => ({ ...m, [sectionId]: res.data?.lessons ?? [] }))
    });
  }

  loadResources(lessonId: number): void {
    this.courseService.listResources(lessonId).subscribe({
      next: (res) => this.resourcesByLesson.update(m => ({ ...m, [lessonId]: res.data?.resources ?? [] }))
    });
  }

  toggleResources(lessonId: number): void {
    if (this.expandedLesson() === lessonId) { this.expandedLesson.set(null); return; }
    this.expandedLesson.set(lessonId);
    this.loadResources(lessonId);
  }

  // ── Sections ───────────────────────────────────────────────────────────────
  addSection(): void {
    if (!this.newSectionTitle.trim()) return;
    this.courseService.createSection({
      course_id: this.courseId,
      titre:     this.newSectionTitle,
      ordre:     this.sections().length + 1
    }).subscribe({
      next: () => { this.newSectionTitle = ''; this.snack.open('Section ajoutée', 'OK', { duration: 1500 }); this.load(); },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur', 'OK', { duration: 3000 })
    });
  }

  askDeleteSection(s: Section): void {
    this.deleteTarget.set({ kind: 'section', label: s.titre, sectionId: s.id });
  }

  askDeleteLesson(l: Lesson, sectionId: number): void {
    this.deleteTarget.set({ kind: 'lesson', label: l.titre, sectionId, lesson: l });
  }

  execDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    if (t.kind === 'section') {
      this.courseService.deleteSection(t.sectionId).subscribe({
        next: () => { this.deleteTarget.set(null); this.snack.open('Section supprimée', 'OK', { duration: 1500 }); this.load(); }
      });
    } else if (t.lesson) {
      this.courseService.deleteLesson(t.lesson.id).subscribe({
        next: () => {
          if (this.expandedLesson() === t.lesson!.id) this.expandedLesson.set(null);
          this.deleteTarget.set(null);
          this.snack.open('Leçon supprimée', 'OK', { duration: 1500 });
          this.loadLessons(t.sectionId);
        }
      });
    }
  }

  // ── Leçons ─────────────────────────────────────────────────────────────────
  addLesson(sectionId: number): void {
    const data = this.getNewLesson(sectionId);
    if (!data.titre.trim() || data.uploading) return;
    const ordre = (this.lessonsBySection()[sectionId] || []).length + 1;

    this.courseService.createLesson({
      section_id: sectionId,
      course_id:  this.courseId,
      titre:      data.titre,
      type:       'texte',
      duree:      data.duree,
      ordre,
      thumbnail:  data.thumbnailUrl || undefined,
      contenu:    ''
    }).subscribe({
      next: () => {
        this.newLesson[sectionId] = this.emptyLesson();
        this.snack.open('Leçon ajoutée', 'OK', { duration: 1500 });
        this.loadLessons(sectionId);
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Erreur lors de la création', 'OK', { duration: 3000 })
    });
  }

  // ── Upload miniature leçon ─────────────────────────────────────────────────
  triggerThumbUpload(sectionId: number): void {
    this.pendingThumbSectionId = sectionId;
    this.thumbInputRef.nativeElement.value = '';
    this.thumbInputRef.nativeElement.click();
  }

  onThumbSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || this.pendingThumbSectionId === null) return;
    const sectionId = this.pendingThumbSectionId;

    if (!MIME_ALLOWED['image'].includes(file.type)) {
      this.fileError.set(
        `Seules les images sont acceptées pour la miniature.\n\nFormats : JPEG, PNG, WebP, GIF\nFichier : "${file.name}" (${file.type || 'type inconnu'})`
      );
      return;
    }

    const lesson = this.getNewLesson(sectionId);
    lesson.uploading = true;
    this.cdr.markForCheck();

    const reader = new FileReader();
    reader.onload = (e) => { lesson.thumbnailPreview = e.target?.result as string; this.cdr.markForCheck(); };
    reader.readAsDataURL(file);

    this.mediaService.upload(file, 'lesson').subscribe({
      next: (res) => {
        lesson.uploading      = false;
        lesson.thumbnailUrl   = res.data?.url ?? '';
        lesson.thumbnailName  = res.data?.fileName || file.name;
        this.cdr.markForCheck();
      },
      error: (err) => {
        lesson.uploading        = false;
        lesson.thumbnailPreview = null;
        this.fileError.set(err?.error?.message ?? "Erreur lors de l'upload");
        this.cdr.markForCheck();
      }
    });
  }

  clearThumbnail(sectionId: number): void {
    const lesson = this.getNewLesson(sectionId);
    lesson.thumbnailUrl = ''; lesson.thumbnailName = ''; lesson.thumbnailPreview = null;
  }

  // ── Upload ressource ───────────────────────────────────────────────────────
  triggerResUpload(lessonId: number): void {
    const resForm = this.getNewRes(lessonId);
    this.pendingResLessonId = lessonId;
    this.pendingResType     = resForm.type;
    const input             = this.resInputRef.nativeElement;
    input.accept            = ACCEPT_MAP[resForm.type] ?? '';
    input.value             = '';
    input.click();
  }

  onResFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || this.pendingResLessonId === null) return;
    const lessonId = this.pendingResLessonId;
    const type     = this.pendingResType;
    const resForm  = this.getNewRes(lessonId);

    const allowed = MIME_ALLOWED[type];
    if (allowed && !allowed.includes(file.type)) {
      this.fileError.set(
        `Type de fichier non autorisé pour une ressource "${type}".\n\n` +
        `Formats acceptés : ${ACCEPT_HINT[type]}\n` +
        `Fichier sélectionné : "${file.name}" (${file.type || 'type inconnu'})`
      );
      return;
    }

    resForm.uploading = true;
    resForm.fileName  = file.name;
    this.cdr.markForCheck();

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => { resForm.filePreview = e.target?.result as string; this.cdr.markForCheck(); };
      reader.readAsDataURL(file);
    }

    this.mediaService.upload(file, 'lesson', lessonId).subscribe({
      next: (res) => {
        resForm.uploading = false;
        resForm.url       = res.data?.url ?? '';
        resForm.fileName  = res.data?.fileName || file.name;
        this.cdr.markForCheck();
      },
      error: (err) => {
        resForm.uploading   = false;
        resForm.filePreview = null;
        resForm.fileName    = '';
        this.fileError.set(err?.error?.message ?? "Erreur lors de l'upload");
        this.cdr.markForCheck();
      }
    });
  }

  clearResFile(lessonId: number): void {
    const r = this.getNewRes(lessonId);
    r.url = ''; r.fileName = ''; r.filePreview = null;
  }

  onResTypeChange(lessonId: number, type: string): void {
    const r = this.getNewRes(lessonId);
    r.type = type; r.url = ''; r.fileName = ''; r.filePreview = null;
  }

  public applyFormat = (evt: Event, cmd: string, lessonId: number, value?: string): void => {
    evt.preventDefault();
    try {
      // execCommand still widely supported for basic toolbar actions
      // cast value to any to avoid strict typing issues
      (document as any).execCommand(cmd, false, (value as any));
    } catch (err) {
      // noop
    }
    // update model from focused editable element
    const active = document.activeElement as HTMLElement | null;
    if (active && active.getAttribute && active.getAttribute('contenteditable') === 'true') {
      this.getNewRes(lessonId).contenu = active.innerHTML;
      this.cdr.markForCheck();
    }
  }

  public applyLink = (lessonId: number): void => {
    // Save current selection/range so we can restore it after the modal steals focus
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        this.savedRange = sel.getRangeAt(0).cloneRange();
      } else {
        this.savedRange = null;
      }
    } catch (e) {
      this.savedRange = null;
    }
    // Open internal modal instead of browser prompt
    this.linkModal.set({ visible: true, url: '', lessonId });
    this.cdr.markForCheck();
  }

  public confirmLink = (): void => {
    const state = this.linkModal();
    const url = (state.url || '').trim();
    if (!url) {
      this.fileError.set('URL requise');
      return;
    }
    // Restore saved selection (if any) so execCommand inserts at the right place
    try {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        if (this.savedRange) {
          sel.addRange(this.savedRange);
        } else if (state.lessonId) {
          // If no saved range, try focusing the editor to insert at caret
          const editor = document.querySelector(`[aria-label="Editeur texte leçon ${state.lessonId}"]`) as HTMLElement | null;
          editor?.focus();
        }
      }
    } catch (e) {
      // ignore
    }
    try { (document as any).execCommand('createLink', false, url); } catch (e) {}
    // Update model from editor content
    if (state.lessonId) {
      const editor = document.querySelector(`[aria-label="Editeur texte leçon ${state.lessonId}"]`) as HTMLElement | null;
      if (editor) this.getNewRes(state.lessonId).contenu = editor.innerHTML;
    }
    this.savedRange = null;
    this.linkModal.set({ visible: false, url: '', lessonId: null });
    this.cdr.markForCheck();
  }

  public cancelLink = (): void => {
    this.linkModal.set({ visible: false, url: '', lessonId: null });
    this.savedRange = null;
    this.cdr.markForCheck();
  }

  public onRichInput = (e: Event, lessonId: number): void => {
    const target = e.target as HTMLElement;
    this.getNewRes(lessonId).contenu = target.innerHTML;
    this.cdr.markForCheck();
  }

  canAddResource(lessonId: number): boolean {
    const r = this.getNewRes(lessonId);
    if (!r.titre.trim() || r.uploading) return false;
    if (r.type === 'lien') return !!r.url.trim();
    if (r.type === 'texte') return !!r.contenu && !!r.contenu.trim();
    return !!r.url;
  }

  // ── Ressources CRUD ────────────────────────────────────────────────────────
  addResource(lessonId: number): void {
    if (!this.canAddResource(lessonId)) return;
    const data = this.newResource[lessonId];
    this.courseService.createResource({
      lesson_id: lessonId,
      titre:     data.titre,
      url:       data.url,
      contenu:   data.contenu,
      type:      data.type as Resource['type'],
      ordre:     (this.resourcesByLesson()[lessonId] || []).length + 1
    }).subscribe({
      next: () => {
        this.newResource[lessonId] = this.emptyRes();
        this.snack.open('Ressource ajoutée', 'OK', { duration: 1500 });
        this.loadResources(lessonId);
      },
      error: (err) => this.snack.open(err?.error?.message ?? "Erreur lors de l'ajout", 'OK', { duration: 3000 })
    });
  }

  removeResource(r: Resource, lessonId: number): void {
    this.courseService.deleteResource(r.id).subscribe({
      next: () => { this.snack.open('Ressource supprimée', 'OK', { duration: 1500 }); this.loadResources(lessonId); }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  resIcon(t?: string): string {
    return ({ video:'videocam', pdf:'picture_as_pdf', audio:'headphones',
              image:'image', lien:'link', autre:'attach_file', mini_projet:'assignment',
              texte:'edit', projet:'folder_open'
            } as Record<string,string>)[t ?? ''] ?? 'attach_file';
  }
  resIconBg(t?: string): string {
    return ({ video:'bg-red-100', pdf:'bg-blue-100', audio:'bg-purple-100',
              image:'bg-green-100', lien:'bg-teal-100', autre:'bg-slate-100', mini_projet:'bg-orange-100',
              texte:'bg-amber-100', projet:'bg-indigo-100'
            } as Record<string,string>)[t ?? ''] ?? 'bg-slate-100';
  }
  resIconColor(t?: string): string {
    return ({ video:'text-red-600', pdf:'text-blue-600', audio:'text-purple-600',
              image:'text-green-600', lien:'text-teal-600', autre:'text-slate-600', mini_projet:'text-orange-600',
              texte:'text-amber-700', projet:'text-indigo-700'
            } as Record<string,string>)[t ?? ''] ?? 'text-slate-600';
  }
  acceptHint(t: string): string { return ACCEPT_HINT[t] ?? ''; }

  emptyLesson(): NewLessonForm {
    return { titre: '', duree: 10, thumbnailUrl: '', thumbnailName: '', thumbnailPreview: null, uploading: false };
  }
  emptyRes(): NewResForm {
    return { titre: '', type: 'lien', url: '', contenu: '', uploading: false, fileName: '', filePreview: null };
  }
  getNewLesson(sectionId: number): NewLessonForm {
    if (!this.newLesson[sectionId]) this.newLesson[sectionId] = this.emptyLesson();
    return this.newLesson[sectionId];
  }
  getNewRes(lessonId: number): NewResForm {
    if (!this.newResource[lessonId]) this.newResource[lessonId] = this.emptyRes();
    return this.newResource[lessonId];
  }
}
