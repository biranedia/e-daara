import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RoleLayoutComponent } from '../role-layout/role-layout.component';
import { SidebarItem } from '@shared/components/app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RoleLayoutComponent],
  template: `
    <app-role-layout
      title="Espace Admin"
      pageTitle="Administration de la plateforme"
      [items]="items">
    </app-role-layout>
  `
})
export class AdminLayoutComponent {
  protected readonly items: SidebarItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Utilisateurs', icon: 'people', route: '/admin/users' },
    { label: 'Validation cours', icon: 'verified', route: '/admin/courses-pending' },
    { label: 'Logs d\'audit', icon: 'security', route: '/admin/audit-logs' },
    { label: 'Statistiques', icon: 'bar_chart', route: '/admin/stats' },
    { label: 'Paramètres', icon: 'settings', route: '/admin/settings' },
    { label: 'RGPD / CDP', icon: 'privacy_tip', route: '/admin/gdpr' },
    { label: 'Badges', icon: 'emoji_events', route: '/admin/badges' },
    { label: 'Certificats', icon: 'workspace_premium', route: '/admin/certificates' },
    { label: 'Messages', icon: 'chat', route: '/admin/messages' },
    { label: 'Mon profil', icon: 'manage_accounts', route: '/admin/profile' }
  ];
}
