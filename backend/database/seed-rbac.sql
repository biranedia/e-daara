-- ===============================================
-- E-DAARA — Données d'initialisation RBAC
-- Rôles, permissions, et utilisateur admin par défaut
-- ===============================================

-- Insérer les rôles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrateur système - accès complet'),
('instructor', 'Formateur - création de cours et gestion'),
('student', 'Apprenant - participation aux cours'),
('visitor', 'Visiteur - accès en lecture seule')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Récupérer les IDs des rôles (pour les permissions)
SET @admin_role_id = (SELECT id FROM roles WHERE name = 'admin');
SET @instructor_role_id = (SELECT id FROM roles WHERE name = 'instructor');
SET @student_role_id = (SELECT id FROM roles WHERE name = 'student');
SET @visitor_role_id = (SELECT id FROM roles WHERE name = 'visitor');

-- ===============================================
-- PERMISSIONS — Module par module
-- ===============================================

-- Auth & Users
INSERT INTO permissions (name, module, description) VALUES
('auth:login', 'auth', 'Se connecter'),
('auth:register', 'auth', 'S\'inscrire'),
('auth:logout', 'auth', 'Se déconnecter'),
('auth:refresh-token', 'auth', 'Renouveler le token'),
('users:read', 'users', 'Consulter son profil'),
('users:update', 'users', 'Modifier son profil'),
('users:change-password', 'users', 'Changer le mot de passe'),
('users:list', 'users', 'Lister les utilisateurs (admin)'),
('users:manage-status', 'users', 'Gérer le statut des utilisateurs (admin)')
ON DUPLICATE KEY UPDATE module = VALUES(module);

-- Courses
INSERT INTO permissions (name, module, description) VALUES
('courses:list', 'courses', 'Lister les cours'),
('courses:read', 'courses', 'Lire les détails d\'un cours'),
('courses:create', 'courses', 'Créer un nouveau cours'),
('courses:update', 'courses', 'Modifier un cours'),
('courses:delete', 'courses', 'Supprimer un cours'),
('courses:publish', 'courses', 'Publier/dépublier un cours'),
('courses:validate', 'courses', 'Valider les cours (admin)')
ON DUPLICATE KEY UPDATE module = VALUES(module);

-- Paths / Learning Paths
INSERT INTO permissions (name, module, description) VALUES
('paths:list', 'paths', 'Lister les parcours'),
('paths:read', 'paths', 'Lire les détails d\'un parcours'),
('paths:create', 'paths', 'Créer un parcours'),
('paths:update', 'paths', 'Modifier un parcours'),
('paths:delete', 'paths', 'Supprimer un parcours')
ON DUPLICATE KEY UPDATE module = VALUES(module);

-- Lessons & Resources
INSERT INTO permissions (name, module, description) VALUES
('lessons:list', 'lessons', 'Lister les leçons'),
('lessons:read', 'lessons', 'Accéder à une leçon'),
('lessons:create', 'lessons', 'Créer une leçon'),
('lessons:update', 'lessons', 'Modifier une leçon'),
('lessons:delete', 'lessons', 'Supprimer une leçon'),
('resources:upload', 'lessons', 'Uploader des ressources (vidéo, PDF)')
ON DUPLICATE KEY UPDATE module = VALUES(module);

-- Assessments (Quiz/Tests)
INSERT INTO permissions (name, module, description) VALUES
('assessments:list', 'assessments', 'Lister les évaluations'),
('assessments:read', 'assessments', 'Accéder à une évaluation'),
('assessments:create', 'assessments', 'Créer une évaluation'),
('assessments:update', 'assessments', 'Modifier une évaluation'),
('assessments:submit', 'assessments', 'Soumettre des réponses à un quiz'),
('assessments:grade', 'assessments', 'Corriger les devoirs')
ON DUPLICATE KEY UPDATE module = VALUES(module);

-- Enrollments (Inscriptions)
INSERT INTO permissions (name, module, description) VALUES
('enrollments:list', 'enrollments', 'Lister ses inscriptions'),
('enrollments:create', 'enrollments', 'S\'inscrire à un cours'),
('enrollments:progress', 'enrollments', 'Consulter sa progression'),
('enrollments:manage', 'enrollments', 'Gérer les inscriptions (admin)')
ON DUPLICATE KEY UPDATE module = VALUES(module);

-- Admin
INSERT INTO permissions (name, module, description) VALUES
('admin:dashboard', 'admin', 'Accéder au tableau de bord admin'),
('admin:statistics', 'admin', 'Consulter les statistiques'),
('admin:audit-logs', 'admin', 'Consulter les logs d\'audit'),
('admin:settings', 'admin', 'Gérer les paramètres'),
('admin:categories', 'admin', 'Gérer les catégories'),
('admin:permissions', 'admin', 'Gérer les permissions')
ON DUPLICATE KEY UPDATE module = VALUES(module);

-- ===============================================
-- ATTRIBUTION PERMISSIONS AUX RÔLES
-- ===============================================

-- ADMIN — Tous les droits
INSERT INTO role_permission (role_id, permission_id) 
SELECT @admin_role_id, id FROM permissions
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

-- INSTRUCTOR (Formateur)
INSERT INTO role_permission (role_id, permission_id)
SELECT @instructor_role_id, id FROM permissions 
WHERE name IN (
  'auth:login', 'auth:logout', 'auth:refresh-token',
  'users:read', 'users:update', 'users:change-password',
  'courses:list', 'courses:read', 'courses:create', 'courses:update', 'courses:delete', 'courses:publish',
  'paths:list', 'paths:read', 'paths:create', 'paths:update', 'paths:delete',
  'lessons:create', 'lessons:update', 'lessons:delete', 'resources:upload',
  'assessments:create', 'assessments:update', 'assessments:grade',
  'enrollments:list'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- STUDENT (Apprenant)
INSERT INTO role_permission (role_id, permission_id)
SELECT @student_role_id, id FROM permissions 
WHERE name IN (
  'auth:login', 'auth:logout', 'auth:refresh-token',
  'users:read', 'users:update', 'users:change-password',
  'courses:list', 'courses:read',
  'paths:list', 'paths:read',
  'lessons:read',
  'assessments:list', 'assessments:read', 'assessments:submit',
  'enrollments:list', 'enrollments:create', 'enrollments:progress'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- VISITOR (Visiteur - non authentifié)
INSERT INTO role_permission (role_id, permission_id)
SELECT @visitor_role_id, id FROM permissions 
WHERE name IN (
  'auth:register', 'auth:login',
  'courses:list', 'courses:read',
  'paths:list', 'paths:read',
  'lessons:read'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- ===============================================
-- UTILISATEUR ADMIN PAR DÉFAUT
-- Email: admin@edaara.sn
-- Password: AdminPass123! (À CHANGER EN PRODUCTION)
-- ===============================================

-- Créer l'utilisateur admin
INSERT INTO users (nom, prenom, email, password, provider, status, email_verified_at, created_at, updated_at) 
VALUES (
  'Admin',
  'E-DAARA',
  'admin@edaara.sn',
  '$2a$12$KIX.SdhwXUWjzj5b5LMG1uWDJMRJ6/aqSh3Z2h.V2XZ3M8Bm2w9QS', -- bcrypt hash de "AdminPass123!"
  'local',
  'active',
  NOW(),
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- Assigner le rôle admin à l'utilisateur admin
SET @admin_user_id = (SELECT id FROM users WHERE email = 'admin@edaara.sn');
INSERT INTO user_role (user_id, role_id) VALUES (@admin_user_id, @admin_role_id)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Créer la table audit_logs si elle n'existe pas
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(100),
  resource_id BIGINT UNSIGNED,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs d\'audit — traçabilité complète des actions (souveraineté)';

-- ===============================================
-- CONFIRMATION
-- ===============================================

SELECT 'Initialisation RBAC terminée avec succès!' as message;
SELECT COUNT(*) as roles_count FROM roles;
SELECT COUNT(*) as permissions_count FROM permissions;
SELECT COUNT(*) as role_permissions_count FROM role_permission;
