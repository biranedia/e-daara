import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-gdpr-confirm-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2 text-red-600">
      <mat-icon color="warn">delete_forever</mat-icon>
      Supprimer mon compte
    </h2>

    <mat-dialog-content class="space-y-3 pt-2">
      <p class="text-slate-600 text-sm leading-relaxed">
        Cette action est <strong>irréversible</strong>. Votre demande sera transmise
        à l'administrateur qui traitera la suppression de votre compte.
      </p>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Motif (facultatif)</mat-label>
        <textarea matInput [formControl]="motifCtrl" rows="3"
                  placeholder="Indiquez un motif si vous le souhaitez…"></textarea>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="gap-2">
      <button mat-stroked-button [mat-dialog-close]="undefined">Annuler</button>
      <button mat-flat-button color="warn" (click)="confirm()">
        <mat-icon>delete_forever</mat-icon> Confirmer la suppression
      </button>
    </mat-dialog-actions>
  `
})
export class GdprConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<GdprConfirmDialogComponent>);
  protected readonly motifCtrl = new FormControl('');

  confirm(): void {
    // On ferme avec la valeur du motif (chaîne vide si rien saisi)
    // undefined = annulation, string = confirmation
    this.dialogRef.close(this.motifCtrl.value ?? '');
  }
}