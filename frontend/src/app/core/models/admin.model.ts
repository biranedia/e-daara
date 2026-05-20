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
  published_courses: number;
  total_enrollments: number;
  total_quiz_submissions: number;
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
  type: 'export' | 'delete' | 'rectify' | 'oblivion';
  /** Backend utilise `statut` (avec t). On garde aussi `status` en alias optionnel. */
  statut?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  detail?: string;
  motif?: string;
  created_at: string;
}
