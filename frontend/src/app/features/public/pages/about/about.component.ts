import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <article class="max-w-3xl mx-auto px-6 py-12 prose">
      <h1 class="text-3xl md:text-4xl font-bold text-edaara-dark mb-4">À propos d'E-DAARA</h1>

      <p class="text-slate-700 leading-relaxed">
        <strong>E-DAARA</strong> (du wolof « école ») est une plateforme d'apprentissage en ligne
        open-source, gratuite et souveraine, conçue pour les apprenants africains.
      </p>

      <h2 class="text-xl font-semibold text-edaara-dark mt-8 mb-2">Notre vision</h2>
      <p class="text-slate-700 leading-relaxed">
        Démocratiser l'accès à une éducation numérique de qualité en Afrique subsaharienne,
        en levant les freins économiques, géographiques et infrastructurels.
      </p>

      <h2 class="text-xl font-semibold text-edaara-dark mt-8 mb-2">Souveraineté numérique</h2>
      <ul class="space-y-2 text-slate-700">
        <li class="flex gap-2">
          <mat-icon class="text-edaara-primary !text-base">check_circle</mat-icon>
          <span>Hébergement local à Dakar — données stockées au Sénégal.</span>
        </li>
        <li class="flex gap-2">
          <mat-icon class="text-edaara-primary !text-base">check_circle</mat-icon>
          <span>Conformité loi sénégalaise n°2008-12 (Commission de Protection des Données).</span>
        </li>
        <li class="flex gap-2">
          <mat-icon class="text-edaara-primary !text-base">check_circle</mat-icon>
          <span>Code source open-source AGPL-3.0 — disponible sur GitHub.</span>
        </li>
        <li class="flex gap-2">
          <mat-icon class="text-edaara-primary !text-base">check_circle</mat-icon>
          <span>Aucune dépendance aux services cloud américains (AWS, Firebase…). Stockage MinIO local.</span>
        </li>
        <li class="flex gap-2">
          <mat-icon class="text-edaara-primary !text-base">check_circle</mat-icon>
          <span>Traçabilité totale via logs d'audit consultables par les administrateurs.</span>
        </li>
      </ul>

      <h2 class="text-xl font-semibold text-edaara-dark mt-8 mb-2">Stack technique</h2>
      <p class="text-slate-700">
        Frontend : <strong>Angular 18</strong>, Material Design, TailwindCSS.<br/>
        Backend : <strong>Node.js / Express</strong>, MySQL, JWT + OAuth 2.0, RBAC.<br/>
        Documentation API : <strong>Swagger / OpenAPI</strong>.
      </p>

      <h2 class="text-xl font-semibold text-edaara-dark mt-8 mb-2">Auteur</h2>
      <p class="text-slate-700">
        Projet de fin d'études de <strong>Birane Diao</strong>,
        Licence Professionnelle en Génie Logiciel — IPG/ISTI, Dakar (2026).
        Encadrement : M. Ahmed.
      </p>
    </article>
  `
})
export class AboutComponent {}
