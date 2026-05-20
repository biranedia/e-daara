/**
 * Modèles transverses : Notifications, Messages, Forum, Annonces, Certificats, Badges.
 */
export interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  titre?: string;
  message: string;
  // Le backend stocke la date de lecture dans `lu_at` (null = non lu)
  lu_at?: string | null;
  /** Helper côté front : true si lu_at est non-null */
  lu?: boolean;
  url?: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  expediteur_nom?: string;
  expediteur_prenom?: string;
  sujet?: string;
  /** Côté backend la colonne est `corps`, on garde un alias `contenu` pour l'UI */
  corps?: string;
  contenu?: string;
  lu_at?: string | null;
  lu?: boolean;
  created_at: string;
}

export interface ForumPost {
  id: number;
  user_id?: number;
  auteur_id?: number;
  user_nom?: string;
  user_prenom?: string;
  titre: string;
  /** Backend = `corps`, frontend en lecture utilisera aussi `contenu` */
  corps?: string;
  contenu?: string;
  course_id?: number | null;
  parent_id?: number | null;
  nb_replies?: number;
  created_at: string;
  updated_at?: string;
}

export interface Announcement {
  id: number;
  user_id?: number;
  auteur_id?: number;
  course_id?: number | null;
  titre: string;
  corps?: string;
  contenu?: string;
  created_at: string;
  updated_at?: string;
}

export interface Certificate {
  id: number;
  user_id: number;
  course_id?: number | null;
  path_id?: number | null;
  course_titre?: string;
  path_titre?: string;
  user_nom?: string;
  user_prenom?: string;
  numero_serie: string;
  date_emission: string;
  url_pdf?: string | null;
}

export interface Badge {
  id: number;
  nom: string;
  description?: string;
  icone?: string;
  critere?: string;
  xp_valeur?: number;
  created_at?: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  badge_nom?: string;
  badge_icone?: string;
  badge_description?: string;
  date_obtention: string;
}
