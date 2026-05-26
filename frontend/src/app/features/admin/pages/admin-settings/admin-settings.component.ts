import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';
import { Setting } from '@core/models';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Paramètres de la plateforme</h1>
        <p class="text-slate-500">Configuration globale</p>
      </header>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
        @for (s of settings(); track s.cle) {
          <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1">
              <code class="text-sm font-semibold text-slate-800">{{ s.cle }}</code>
              @if (s.description) {
                <p class="text-xs text-slate-500 mt-0.5">{{ s.description }}</p>
              }
            </div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full sm:w-80">
              <input matInput [(ngModel)]="s.valeur" />
            </mat-form-field>
            <button mat-stroked-button color="primary" (click)="save(s)">
              <mat-icon>save</mat-icon>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly snack = inject(MatSnackBar);

  protected readonly settings = signal<Setting[]>([]);

  ngOnInit(): void {
    this.admin.listSettings().subscribe({
      next: (res) => this.settings.set(res.data?.settings ?? [])
    });
  }

  save(s: Setting): void {
    this.admin.updateSetting(s.cle, s.valeur).subscribe({
      next: () => this.snack.open(`Paramètre "${s.cle}" sauvegardé`, 'OK', { duration: 2000 }),
      error: () => this.snack.open('Erreur', 'OK', { duration: 3000 })
    });
  }
}
