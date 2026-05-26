import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  AdminDashboardStats,
  AdminUserRow,
  ApiResponse,
  AuditLog,
  Course,
  CourseValidation,
  GdprRequest,
  Setting,
  StatsSnapshot,
  StudentDashboardStats
} from '../models';

/**
 * Service Administration — souveraineté numérique en tête (audit logs).
 * Endpoints : /api/admin/* + /api/stats + /api/settings + /api/gdpr + /api/dashboard
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  // ----- Dashboard admin -----
  dashboard() {
    return this.api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard');
  }

  // ----- Dashboard apprenant -----
  studentDashboard() {
    return this.api.get<ApiResponse<StudentDashboardStats>>('/dashboard/student');
  }

  // ----- Gestion utilisateurs -----
  listUsers() {
    return this.api.get<ApiResponse<{ users: AdminUserRow[] }>>('/admin/users');
  }

  /** Créer un utilisateur depuis l'interface admin */
  createUser(payload: { nom: string; prenom: string; email: string; password: string; roles: string[] }) {
    return this.api.post<ApiResponse<{ userId: number }>>('/admin/users', payload);
  }

  /** Modifier nom, prénom, email (et optionnellement le mot de passe) d'un utilisateur */
  updateUser(userId: number, payload: { nom?: string; prenom?: string; email?: string; password?: string }) {
    return this.api.put<ApiResponse<unknown>>(`/admin/users/${userId}`, payload);
  }

  /** Suppression douce (soft delete) d'un utilisateur */
  deleteUser(userId: number) {
    return this.api.delete<ApiResponse<unknown>>(`/admin/users/${userId}`);
  }

  updateUserStatus(userId: number, status: AdminUserRow['status']) {
    return this.api.put<ApiResponse<unknown>>(`/admin/users/${userId}/status`, { status });
  }

  assignRoles(userId: number, roles: string[]) {
    return this.api.put<ApiResponse<unknown>>(`/admin/users/${userId}/roles`, { roles });
  }

  // ----- Validation des cours -----
  pendingCourses() {
    return this.api.get<ApiResponse<{ courses: Course[] }>>('/admin/courses/pending');
  }

  validateCourse(id: number, decision: 'approved' | 'rejected', commentaire?: string) {
    return this.api.post<ApiResponse<unknown>>(`/admin/courses/${id}/validate`, {
      decision,
      commentaire
    });
  }

  /** Historique complet des validations automatiques et manuelles */
  validationHistory() {
    return this.api.get<ApiResponse<{ validations: CourseValidation[] }>>('/admin/courses/validations');
  }

  // ----- Audit logs (coeur souveraineté) -----
  auditLogs() {
    return this.api.get<ApiResponse<{ logs: AuditLog[] }>>('/admin/audit-logs');
  }

  // ----- Statistiques globales -----
  latestStats() {
    return this.api.get<ApiResponse<{ snapshot: StatsSnapshot }>>('/stats/latest');
  }

  statsHistory(limit = 30) {
    return this.api.get<ApiResponse<{ snapshots: StatsSnapshot[] }>>('/stats/history', { limit });
  }

  refreshStats() {
    return this.api.post<ApiResponse<unknown>>('/stats/refresh', {});
  }

  // ----- Paramètres plateforme -----
  listSettings() {
    return this.api.get<ApiResponse<{ settings: Setting[] }>>('/settings');
  }

  updateSetting(cle: string, valeur: string) {
    return this.api.put<ApiResponse<unknown>>(`/settings/${cle}`, { valeur });
  }

  // ----- RGPD / Loi sénégalaise n°2008-12 -----
  myGdprRequests() {
    return this.api.get<ApiResponse<{ requests: GdprRequest[] }>>('/gdpr/mine');
  }

  allGdprRequests() {
    return this.api.get<ApiResponse<{ requests: GdprRequest[] }>>('/gdpr');
  }

  createGdprRequest(type: GdprRequest['type'], detail?: string) {
    return this.api.post<ApiResponse<{ requestId: number }>>('/gdpr', { type, detail });
  }

  updateGdprStatus(id: number, statut: GdprRequest['statut']) {
    return this.api.put<ApiResponse<unknown>>(`/gdpr/${id}/status`, { statut });
  }
}
