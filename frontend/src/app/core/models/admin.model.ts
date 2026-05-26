/**
 * Modèles utilisés par l'espace Administration.
 * AuditLog est central pour la souveraineté numérique (CDC §6.4).
 */
export interface AuditLog {
  id: number;
  user_id?: number | null;
  email?: string | null;
  action: string;
  module: string;
  resource_type?: string | null;
  resource_id?: number | null;
  ip_address?: string | null;
  statut: 'success' | 'failure' | 'pending';
  detail?: string | null;
  created_at: string;
}

export interface AdminDashboardStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  suspended_users: number;
  published_courses: number;
  pending_courses: number;
  draft_courses: number;
  total_enrollments: number;
  completed_enrollments: number;
  total_quiz_submissions: number;
  recent_users?: Array<{ id: number; nom: string; prenom: string; email: string; status: string; created_at: string }>;
  recent_logs?: Array<{ action: string; module: string; email: string; created_at: string; statut: string }>;
}

export interface StatsSnapshot {
  id: number;
  snap_date: string;
  total_users: number;
  total_apprenants: number;
  total_formateurs: number;
  total_cours: number;
  total_inscriptions: number;
  total_completions: number;
  total_quizzes: number;
  created_at: string;
}

export interface StudentDashboardStats {
  enrolled_courses: number;
  completed_courses: number;
  enrolled_paths: number;
  avg_progression: number;
}

export interface AdminUserRow {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  roles?: string[];
  created_at: string;
  last_login_at?: string | null;
}

export interface Setting {
  cle: string;
  valeur: string;
  description?: string;
}

export interface GdprRequest {
  id: number;
  user_id: number;
  user_email?: string;
  treated_by_email?: string;
  /** Valeurs acceptées par le backend : access | delete | rectify | portability */
  type: 'access' | 'delete' | 'rectify' | 'portability';
  /** Colonne réelle : gdpr_requests.statut (pas status) */
  statut: 'pending' | 'processing' | 'completed' | 'rejected';
  detail?: string;
  created_at: string;
  updated_at?: string;
}
