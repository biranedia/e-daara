/**
 * Modèles liés au domaine Évaluation (Quiz, Questions, Réponses, Résultats).
 */
export interface Assessment {
  id: number;
  course_id?: number;
  lesson_id?: number;
  titre: string;
  description?: string;
  score_max?: number;
  score_passage?: number;
  tentatives_max?: number;
  duree_minutes?: number;
  ordre?: number;
  status?: 'draft' | 'published';
  type?: 'quiz' | 'examen' | 'devoir';
  created_at?: string;
  updated_at?: string;
  /** Champs joints depuis le backend (LEFT JOIN courses / lessons) */
  course_titre?: string;
  lesson_titre?: string;
}

export interface Question {
  id: number;
  assessment_id: number;
  enonce: string;
  type: 'qcm' | 'vrai_faux' | 'texte';
  points: number;
  ordre?: number;
}

export interface Answer {
  id: number;
  question_id: number;
  texte: string;
  est_correcte: boolean;
}

export interface QuizSubmission {
  assessment_id: number;
  answers: { question_id: number; answer_id?: number; texte?: string }[];
}

export interface QuizResult {
  id: number;
  user_id: number;
  assessment_id: number;
  score: number;
  total: number;
  tentative_numero: number;
  duree_passage?: number;
  date_soumission: string;
  est_reussi: boolean;
}
