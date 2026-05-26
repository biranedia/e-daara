/**
 * Modèle Inscription d'un apprenant à un cours / parcours.
 */
export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  course_titre?: string;
  /** Colonne réelle retournée par le backend : enrollments.enrolled_at */
  enrolled_at: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progression: number;
  /** Colonne réelle retournée par le backend : enrollments.completed_at */
  completed_at?: string | null;
  // Champs supplémentaires retournés par le JOIN dans GET /enrollments
  course_slug?: string;
  thumbnail?: string | null;
  niveau?: string;
  course_status?: string;
  instructor_id?: number;
  instructor_nom?: string;
  instructor_prenom?: string;
  last_lesson_title?: string | null;
  derniere_lecon?: number | null;
}

export interface LessonProgress {
  id?: number;
  user_id?: number;
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  duration_seconds?: number;
  last_position?: number;
  updated_at?: string;
}

export interface WorkSession {
  id: number;
  user_id: number;
  course_id?: number;
  /** Colonne réelle : work_sessions.debut */
  debut: string;
  /** Colonne réelle : work_sessions.fin */
  fin?: string | null;
  /** Colonne réelle : work_sessions.duree_min */
  duree_min?: number;
  lesson_id?: number | null;
  // Champs joints
  course_titre?: string;
  lesson_titre?: string;
}
