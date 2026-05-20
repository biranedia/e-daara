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
    { label: 'Catalogue', icon: 'explore', route: '/catalogue' },
    { label: 'Mes parcours', icon: 'route', route: '/student/paths' },
    { label: 'Certificats', icon: 'workspace_premium', route: '/student/certificates' },
    { label: 'Badges', icon: 'military_tech', route: '/student/badges' },
    { label: 'Forum', icon: 'forum', route: '/forum' },
    { label: 'Messages', icon: 'mail', route: '/messages' }
  ];
}
