import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '@core/services/course.service';
import { Course } from '@core/models';

/**
 * Home publique — première page que voit un visiteur.
 * Hero + propositions de valeur + cours en avant + souveraineté.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <!-- Hero -->
    <section class="bg-gradient-to-br from-edaara-primary to-teal-800 text-white py-20 px-6">
      <div class="max-w-5xl mx-auto text-center">
        <p class="inline-block px-4 py-1 rounded-full bg-white/15 text-sm mb-4">
          🇸🇳 Plateforme souveraine — hébergée à Dakar
        </p>
        <h1 class="text-4xl md:text-6xl font-extrabold leading-tight">
          L'école numérique gratuite,<br/>
          <span class="text-edaara-accent">pour toute l'Afrique.</span>
        </h1>
        <p class="text-lg md:text-xl text-teal-100 mt-6 max-w-2xl mx-auto">
          E-DAARA donne accès à des cours, parcours et certificats — sans frais,
          adaptés aux réalités africaines : mobile-first, multilingue, données protégées.
        </p>
        <div class="flex flex-wrap gap-3 justify-center mt-8">
          <a mat-flat-button color="accent" routerLink="/auth/register" class="!h-12 !px-6 !text-base">
            Créer mon compte gratuit
          </a>
          <a mat-stroked-button routerLink="/catalogue"
             class="!h-12 !px-6 !text-base !text-white !border-white">
            Explorer le catalogue
          </a>
        </div>
      </div>
    </section>

    <!-- Propositions de valeur -->
    <section class="py-16 px-6 max-w-6xl mx-auto">
      <div class="grid md:grid-cols-3 gap-6">
        <article class="text-center p-6">
          <div class="w-14 h-14 mx-auto rounded-full bg-edaara-primary/10 flex items-center justify-center">
            <mat-icon class="text-edaara-primary !w-8 !h-8 !text-3xl">school</mat-icon>
          </div>
          <h3 class="font-bold text-edaara-dark mt-4 text-lg">100% gratuit</h3>
          <p class="text-slate-600 mt-2">
            Tous les cours, parcours, quiz et certificats sont accessibles sans frais.
          </p>
        </article>
        <article class="text-center p-6">
          <div class="w-14 h-14 mx-auto rounded-full bg-edaara-accent/10 flex items-center justify-center">
            <mat-icon class="text-edaara-accent !w-8 !h-8 !text-3xl">shield</mat-icon>
          </div>
          <h3 class="font-bold text-edaara-dark mt-4 text-lg">Souveraineté numérique</h3>
          <p class="text-slate-600 mt-2">
            Hébergement local, conformité loi sénégalaise n°2008-12, open-source AGPL-3.0.
          </p>
        </article>
        <article class="text-center p-6">
          <div class="w-14 h-14 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
            <mat-icon class="text-purple-600 !w-8 !h-8 !text-3xl">phone_android</mat-icon>
          </div>
          <h3 class="font-bold text-edaara-dark mt-4 text-lg">Mobile-first</h3>
          <p class="text-slate-600 mt-2">
            Conçu pour les connexions mobiles africaines. Léger, rapide, accessible.
          </p>
        </article>
      </div>
    </section>

    <!-- Cours en avant -->
    <section class="py-16 px-6 bg-slate-100">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-edaara-dark">Cours populaires</h2>
          <a routerLink="/catalogue" class="text-edaara-primary hover:underline font-medium">
            Voir tout le catalogue →
          </a>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (c of featured(); track c.id) {
            <a [routerLink]="['/courses', c.id]"
               class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow block">
              <div class="h-36 bg-gradient-to-br from-edaara-primary to-teal-700 flex items-center justify-center">
                <mat-icon class="!w-14 !h-14 !text-6xl text-white/80">menu_book</mat-icon>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-edaara-dark line-clamp-1">{{ c.titre }}</h3>
                <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ c.description }}</p>
                <div class="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span>{{ c.instructor_prenom }} {{ c.instructor_nom }}</span>
                  <span>{{ c.nb_inscrits || 0 }} inscrits</span>
                </div>
              </div>
            </a>
          } @empty {
            <p class="col-span-full text-center py-12 text-slate-500">
              Pas encore de cours publié. Soyez le premier à proposer un cours !
            </p>
          }
        </div>
      </div>
    </section>

    <!-- CTA souveraineté -->
    <section class="py-16 px-6 bg-edaara-dark text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-2xl md:text-3xl font-bold">
          Une plateforme africaine, pour les Africains.
        </h2>
        <p class="text-slate-300 mt-4">
          E-DAARA est un projet open-source développé au Sénégal.
          Vos données restent en Afrique, sous la juridiction de la CDP.
        </p>
        <div class="flex flex-wrap gap-3 justify-center mt-6">
          <a mat-flat-button color="accent" routerLink="/auth/register" class="!h-12 !px-6">
            Rejoindre E-DAARA
          </a>
          <a mat-stroked-button routerLink="/about" class="!h-12 !px-6 !text-white !border-white">
            En savoir plus
          </a>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  protected readonly featured = signal<Course[]>([]);

  ngOnInit(): void {
    this.courseService.listPublic({ limit: 6 }).subscribe({
      next: (res) => this.featured.set(res.data?.courses ?? [])
    });
  }
}
