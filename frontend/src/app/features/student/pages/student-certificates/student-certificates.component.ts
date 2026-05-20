import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SocialService } from '@core/services/social.service';
import { Certificate } from '@core/models';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Mes certificats</h1>
        <p class="text-slate-500">{{ certificates().length }} certificat(s) obtenu(s)</p>
      </header>

      <div class="grid sm:grid-cols-2 gap-4">
        @for (c of certificates(); track c.id) {
          <article class="bg-white rounded-xl shadow-sm border-2 border-edaara-accent/30 p-6 relative">
            <div class="absolute top-3 right-3">
              <mat-icon class="!w-10 !h-10 !text-4xl text-edaara-accent">workspace_premium</mat-icon>
            </div>
            <h3 class="font-bold text-edaara-dark pr-12">{{ c.course_titre || ('Cours #' + c.course_id) }}</h3>
            <p class="text-xs text-slate-500 mt-2">
              Numéro : <code class="bg-slate-100 px-1.5 py-0.5 rounded">{{ c.numero_serie }}</code>
            </p>
            <p class="text-xs text-slate-500">
              Émis le {{ c.date_emission | date:'dd MMMM yyyy' }}
            </p>
            @if (c.url_pdf) {
              <a mat-stroked-button color="primary" [href]="c.url_pdf" target="_blank" rel="noopener" class="mt-4">
                <mat-icon>download</mat-icon> Télécharger PDF
              </a>
            }
          </article>
        } @empty {
          <div class="col-span-full bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
            <mat-icon class="!w-12 !h-12 !text-5xl text-slate-300">workspace_premium</mat-icon>
            <p class="text-slate-600 mt-3">
              Aucun certificat encore. Terminez un cours pour en obtenir un.
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class StudentCertificatesComponent implements OnInit {
  private readonly social = inject(SocialService);
  protected readonly certificates = signal<Certificate[]>([]);

  ngOnInit(): void {
    this.social.listMyCertificates().subscribe({
      next: (res) => this.certificates.set(res.data?.certificates ?? [])
    });
  }
}
