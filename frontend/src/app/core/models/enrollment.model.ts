/**
 * Modèle Inscription d'un apprenant à un cours / parcours.
 */
export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  course_titre?: string;
  date_inscription: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progression: number;
  date_completude?: string | null;
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
  date_debut: string;
  date_fin?: string | null;
  duree_minutes?: number;
}
