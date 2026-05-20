/**
 * Modèles liés au domaine Cours / Sections / Leçons / Ressources.
 * Tous les champs reflètent les colonnes de la base E-DAARA.
 */
export interface Course {
  id: number;
  titre: string;
  slug?: string;
  description?: string | null;
  objectifs?: string | null;
  prerequis?: string | null;
  niveau?: 'debutant' | 'intermediaire' | 'avance';
  duree?: number;
  category_id?: number | null;
  category_name?: string | null;
  instructor_id?: number;
  instructor_nom?: string;
  instructor_prenom?: string;
  langue?: string;
  thumbnail?: string | null;
  nb_inscrits?: number;
  note_moyenne?: number;
  status?: 'draft' | 'pending' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Section {
  id: number;
  course_id: number;
  titre: string;
  description?: string;
  ordre: number;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: number;
  section_id: number;
  titre: string;
  slug?: string;
  description?: string;
  contenu?: string;
  type?: 'video' | 'pdf' | 'texte' | 'lien' | 'projet';
  url?: string | null;
  duree?: number;
  ordre: number;
  is_free?: boolean;
  status?: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface Resource {
  id: number;
  lesson_id?: number;
  course_id?: number;
  titre: string;
  description?: string;
  type: 'video' | 'pdf' | 'lien' | 'image' | 'audio' | 'mini_projet' | 'autre';
  url: string;
  taille?: number;
  ordre?: number;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  nb_cours?: number;
}

export interface Path {
  id: number;
  titre: string;
  slug?: string;
  description?: string;
  duree_estimee?: number;
  niveau?: 'debutant' | 'intermediaire' | 'avance';
  status?: 'draft' | 'published' | 'archived';
  instructor_id?: number;
  instructor_nom?: string;
  instructor_prenom?: string;
  nb_cours?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MediaFile {
  id: number;
  user_id: number;
  nom_original: string;
  nom_stockage: string;
  mime_type: string;
  taille: number;
  url: string;
  contexte?: 'cours' | 'lecon' | 'profil' | 'badge' | 'autre';
  resource_id?: number | null;
  created_at: string;
}
