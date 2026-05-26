import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RoleLayoutComponent } from '../role-layout/role-layout.component';
import { SidebarItem } from '@shared/components/app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-instructor-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RoleLayoutComponent],
  template: `
    <app-role-layout
      title="Espace Formateur"
      pageTitle="Espace formateur"
      [items]="items">
    </app-role-layout>
  `
})
export class InstructorLayoutComponent {
  protected readonly items: SidebarItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/instructor/dashboard' },
    { label: 'Mes cours', icon: 'menu_book', route: '/instructor/courses' },
    { label: 'Mes parcours', icon: 'route', route: '/instructor/paths' },
    { label: 'Évaluations', icon: 'quiz', route: '/instructor/assessments' },
    { label: 'Annonces', icon: 'campaign', route: '/instructor/announcements' },
    { label: 'Statistiques', icon: 'insights', route: '/instructor/stats' },
    { label: 'Messages', icon: 'chat', route: '/instructor/messages' },
    { label: 'Mon profil', icon: 'manage_accounts', route: '/instructor/profile' }
  ];
}
