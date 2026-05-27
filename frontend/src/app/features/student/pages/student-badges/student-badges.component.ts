import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SocialService } from '@core/services/social.service';
import { Badge, UserBadge } from '@core/models';

@Component({
  selector: 'app-student-badges',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Mes badges</h1>
        <p class="text-slate-500">{{ myBadges().length }} badge(s) débloqué(s)</p>
      </header>

      <section>
        <h2 class="text-lg font-semibold text-slate-700 mb-3">Débloqués</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          @for (b of myBadges(); track b.id) {
            <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <div class="w-16 h-16 mx-auto rounded-full bg-edaara-accent/20 flex items-center justify-center text-3xl">
                {{ b.badge_icone || '🏅' }}
              </div>
              <p class="text-sm font-semibold text-edaara-dark mt-2">{{ b.badge_nom }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ b.badge_description }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ b.obtenu_at | date:'dd/MM/yyyy' }}</p>
            </div>
          } @empty {
            <p class="col-span-full text-center py-6 text-slate-500">Aucun badge débloqué</p>
          }
        </div>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-slate-700 mb-3">À débloquer</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          @for (b of locked(); track b.id) {
            <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center opacity-50">
              <div class="w-16 h-16 mx-auto rounded-full bg-slate-200 flex items-center justify-center">
                <mat-icon class="!w-10 !h-10 !text-4xl text-slate-400">lock</mat-icon>
              </div>
              <p class="text-sm font-semibold text-slate-600 mt-2">{{ b.nom }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ b.critere || b.description }}</p>
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class StudentBadgesComponent implements OnInit {
  private readonly social = inject(SocialService);
  protected readonly myBadges = signal<UserBadge[]>([]);
  protected readonly locked = signal<Badge[]>([]);

  ngOnInit(): void {
    this.social.listMyBadges().subscribe({
      next: (res) => this.myBadges.set(res.data?.badges ?? [])
    });
    this.social.listAllBadges().subscribe({
      next: (res) => {
        const all = res.data?.badges ?? [];
        const mineIds = new Set(this.myBadges().map((b) => b.badge_id));
        this.locked.set(all.filter((b) => !mineIds.has(b.id)));
      }
    });
  }
}
