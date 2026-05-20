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
  tentatives_max?: number;
  duree_minutes?: number;
  type?: 'quiz' | 'examen' | 'devoir';
  created_at?: string;
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
