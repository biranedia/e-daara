/**
 * Modèle utilisateur — reflet de la table `users` du backend.
 * Aligné sur la réponse de GET /api/users/profile.
 */
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  avatar?: string | null;
  bio?: string | null;
  date_naissance?: string | null;
  langue_pref?: string | null;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  created_at?: string;
  last_login_at?: string | null;
  roles?: string[];
}

/**
 * Réponse standard du backend (login / register).
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    email: string;
    nom: string;
    prenom: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

/**
 * Réponse standard générique du backend.
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
}
