import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SocialService } from '@core/services/social.service';
import { Notification } from '@core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-8 space-y-3">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Notifications</h1>
        <p class="text-slate-500">{{ notifications().length }} notification(s)</p>
      </header>

      @for (n of notifications(); track n.id) {
        <article class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-3"
                 [class.border-l-4]="!n.lu_at"
                 [class.border-l-edaara-primary]="!n.lu_at">
          <mat-icon [class]="iconColor(n.type)">{{ iconName(n.type) }}</mat-icon>
          <div class="flex-1">
            @if (n.titre) {
              <p class="font-semibold text-edaara-dark">{{ n.titre }}</p>
            }
            <p class="text-sm text-slate-700">{{ n.message }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ n.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <div class="flex flex-col gap-1">
            @if (!n.lu_at) {
              <button mat-icon-button (click)="markRead(n)" aria-label="Marquer comme lu">
                <mat-icon>check_circle</mat-icon>
              </button>
            }
            <button mat-icon-button (click)="remove(n)" aria-label="Supprimer">
              <mat-icon class="!text-red-500">delete</mat-icon>
            </button>
          </div>
        </article>
      } @empty {
        <p class="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-100">
          Aucune notification
        </p>
      }
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private readonly social = inject(SocialService);
  protected readonly notifications = signal<Notification[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.social.listNotifications().subscribe({
      next: (res) => this.notifications.set(res.data?.notifications ?? [])
    });
  }

  markRead(n: Notification): void {
    this.social.markNotificationRead(n.id).subscribe({ next: () => this.load() });
  }

  remove(n: Notification): void {
    this.social.deleteNotification(n.id).subscribe({ next: () => this.load() });
  }

  iconName(t: string): string {
    return { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' }[t] ?? 'notifications';
  }

  iconColor(t: string): string {
    return {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-amber-500',
      error: 'text-red-500'
    }[t] ?? 'text-slate-500';
  }
}
