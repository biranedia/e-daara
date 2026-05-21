import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RoleLayoutComponent } from '../role-layout/role-layout.component';
import { SidebarItem } from '@shared/components/app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RoleLayoutComponent],
  template: `
    <app-role-layout
      title="Espace Apprenant"
      pageTitle="Mon espace d'apprentissage"
      [items]="items">
    </app-role-layout>
  `
})
export class StudentLayoutComponent {
  protected readonly items: SidebarItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/student/dashboard' },
    { label: 'Mes cours', icon: 'school', route: '/student/courses' },
    { label: 'Catalogue', icon: 'explore', route: '/student/catalogue' },
    { label: 'Mes parcours', icon: 'route', route: '/student/paths' },
    { label: 'Certificats', icon: 'workspace_premium', route: '/student/certificates' },
    { label: 'Badges', icon: 'military_tech', route: '/student/badges' },
    { label: 'Forum', icon: 'forum', route: '/student/forum' },
    { label: 'Messages', icon: 'chat', route: '/student/messages' },
    { label: 'Notifications', icon: 'notifications', route: '/student/notifications' },
    { label: 'Mon profil', icon: 'manage_accounts', route: '/student/profile' }
  ];
}
