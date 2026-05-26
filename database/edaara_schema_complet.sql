-- =============================================================
--  E-DAARA — Schéma de base de données complet (v2.0)
--  Plateforme d'apprentissage en ligne souveraine pour l'Afrique
--  Auteur : Birane Diao — IPG/ISTI — Licence Génie Logiciel IG3
--  Moteur : MySQL 8.0 — utf8mb4 — InnoDB
--  Dérivé du diagramme de classes UML (Plan Directeur v1.0)
-- =============================================================

CREATE DATABASE IF NOT EXISTS edaara_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE edaara_db;

-- =============================================================
-- DOMAINE 1 : UTILISATEURS & RBAC
-- Tables : users, roles, permissions, role_permission, user_role
-- =============================================================

-- Table principale des utilisateurs (classe mère Utilisateur)
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  nom             VARCHAR(100)     NOT NULL,
  prenom          VARCHAR(100)     NOT NULL,
  email           VARCHAR(255)     UNIQUE NOT NULL,
  email_verified_at TIMESTAMP      NULL,
  password        VARCHAR(255)     NULL            COMMENT 'NULL si authentification OAuth uniquement',
  phone           VARCHAR(20)      NULL,
  avatar          VARCHAR(500)     NULL,
  bio             TEXT             NULL,
  provider        ENUM('local','google','facebook') DEFAULT 'local' COMMENT 'Fournisseur d identité OAuth 2.0',
  provider_id     VARCHAR(255)     NULL            COMMENT 'ID renvoyé par Google / Facebook',
  date_naissance  DATE             NULL,
  pays            VARCHAR(100)     NULL            DEFAULT 'Sénégal',
  langue_pref     VARCHAR(10)      NULL            DEFAULT 'fr' COMMENT 'Préférence de langue (fr, en, wo…)',
  status          ENUM('active','inactive','suspended') DEFAULT 'active',
  last_login_at   TIMESTAMP        NULL,
  remember_token  VARCHAR(100)     NULL,
  created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP        NULL            COMMENT 'Soft delete — conformité CDP Sénégal',
  INDEX idx_email    (email),
  INDEX idx_status   (status),
  INDEX idx_provider (provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Utilisateur — entité centrale RBAC';

-- Profil étendu Apprenant (hérite de users)
CREATE TABLE IF NOT EXISTS learner_profiles (
  user_id           BIGINT UNSIGNED  PRIMARY KEY,
  niveau_scolaire   VARCHAR(100)     NULL,
  objectif          TEXT             NULL            COMMENT 'Objectif d apprentissage déclaré',
  total_heures      DECIMAL(8,2)     DEFAULT 0       COMMENT 'Cumul temps de travail en heures',
  total_cours       INT UNSIGNED     DEFAULT 0       COMMENT 'Cours complétés à vie',
  xp_points         INT UNSIGNED     DEFAULT 0       COMMENT 'Points d expérience gamification',
  created_at        TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Profil étendu Apprenant';

-- Profil étendu Formateur (hérite de users)
CREATE TABLE IF NOT EXISTS instructor_profiles (
  user_id       BIGINT UNSIGNED  PRIMARY KEY,
  biographie    TEXT             NULL,
  specialite    VARCHAR(255)     NULL,
  site_web      VARCHAR(500)     NULL,
  linkedin      VARCHAR(500)     NULL,
  note_moyenne  DECIMAL(3,2)     DEFAULT 0.00      COMMENT 'Note moyenne calculée sur les évaluations',
  nb_apprenants INT UNSIGNED     DEFAULT 0         COMMENT 'Nombre total d apprenants inscrits',
  valide        BOOLEAN          DEFAULT FALSE      COMMENT 'Formateur validé par l administrateur',
  created_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Profil étendu Formateur';

-- Rôles RBAC
CREATE TABLE IF NOT EXISTS roles (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100)     UNIQUE NOT NULL COMMENT 'admin | instructor | student | visitor',
  description TEXT             NULL,
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions atomiques
CREATE TABLE IF NOT EXISTS permissions (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255)     UNIQUE NOT NULL,
  module      VARCHAR(100)     NULL   COMMENT 'Module applicatif : auth | cours | quiz | admin …',
  description TEXT             NULL,
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pivot rôle ↔ permission
CREATE TABLE IF NOT EXISTS role_permission (
  role_id       BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pivot utilisateur ↔ rôle
CREATE TABLE IF NOT EXISTS user_role (
  user_id    BIGINT UNSIGNED NOT NULL,
  role_id    BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokens JWT refresh (rotation sécurisée)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED  NOT NULL,
  token_hash  VARCHAR(255)     NOT NULL COMMENT 'Hash SHA-256 du refresh token',
  ip_address  VARCHAR(45)      NULL,
  user_agent  TEXT             NULL,
  expires_at  TIMESTAMP        NOT NULL,
  revoked     BOOLEAN          DEFAULT FALSE,
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires    (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Rotation des refresh tokens JWT — sécurité OWASP';

-- Réinitialisation mot de passe
CREATE TABLE IF NOT EXISTS password_resets (
  id         BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED  NOT NULL,
  token_hash VARCHAR(255)     NOT NULL,
  expires_at TIMESTAMP        NOT NULL,
  used       BOOLEAN          DEFAULT FALSE,
  created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DOMAINE 2 : CATALOGUE — PARCOURS & COURS
-- Tables : categories, tags, paths (parcours), courses,
--          path_course, course_tag
-- =============================================================

-- Catégories thématiques
CREATE TABLE IF NOT EXISTS categories (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255)     NOT NULL UNIQUE,
  slug        VARCHAR(255)     NOT NULL UNIQUE,
  description TEXT             NULL,
  icon        VARCHAR(255)     NULL,
  couleur     VARCHAR(7)       NULL COMMENT 'Code couleur HEX pour l UI',
  parent_id   BIGINT UNSIGNED  NULL COMMENT 'Hiérarchie de catégories (sous-catégorie)',
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags libres pour la recherche
CREATE TABLE IF NOT EXISTS tags (
  id         BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100)     NOT NULL UNIQUE,
  slug       VARCHAR(100)     NOT NULL UNIQUE,
  created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parcours (agrégat de cours ordonnés)
CREATE TABLE IF NOT EXISTS paths (
  id              BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  titre           VARCHAR(255)     NOT NULL,
  slug            VARCHAR(255)     NOT NULL UNIQUE,
  description     LONGTEXT         NULL,
  objectifs       TEXT             NULL COMMENT 'Ce que l apprenant saura faire en fin de parcours',
  prerequis       TEXT             NULL,
  niveau          ENUM('debutant','intermediaire','avance') DEFAULT 'debutant',
  duree_estimee   INT              NULL COMMENT 'Durée estimée en heures',
  thumbnail       VARCHAR(500)     NULL,
  category_id     BIGINT UNSIGNED  NULL,
  instructor_id   BIGINT UNSIGNED  NOT NULL,
  status          ENUM('draft','published','archived') DEFAULT 'draft',
  created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP        NULL,
  FOREIGN KEY (category_id)   REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (instructor_id) REFERENCES users(id)      ON DELETE CASCADE,
  INDEX idx_slug   (slug),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Parcours — agrégat de cours';

-- Cours individuels
CREATE TABLE IF NOT EXISTS courses (
  id            BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  titre         VARCHAR(255)     NOT NULL,
  slug          VARCHAR(255)     NOT NULL UNIQUE,
  description   LONGTEXT         NULL,
  objectifs     TEXT             NULL,
  prerequis     TEXT             NULL,
  instructor_id BIGINT UNSIGNED  NOT NULL,
  category_id   BIGINT UNSIGNED  NULL,
  niveau        ENUM('debutant','intermediaire','avance') DEFAULT 'debutant',
  duree         INT              NULL COMMENT 'Durée totale estimée en heures',
  thumbnail     VARCHAR(500)     NULL,
  prix          DECIMAL(10,2)    DEFAULT 0.00 COMMENT 'Gratuit par défaut (souveraineté)',
  langue        VARCHAR(10)      DEFAULT 'fr',
  status        ENUM('draft','pending','published','archived') DEFAULT 'draft'
                COMMENT 'pending = soumis pour validation Admin',
  note_moyenne  DECIMAL(3,2)     DEFAULT 0.00,
  nb_inscrits   INT UNSIGNED     DEFAULT 0,
  created_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP        NULL,
  FOREIGN KEY (instructor_id) REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (category_id)   REFERENCES categories(id)   ON DELETE SET NULL,
  INDEX idx_slug        (slug),
  INDEX idx_status      (status),
  INDEX idx_instructor  (instructor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Cours';

-- Pivot parcours ↔ cours (ordre des cours dans un parcours)
CREATE TABLE IF NOT EXISTS path_course (
  path_id    BIGINT UNSIGNED NOT NULL,
  course_id  BIGINT UNSIGNED NOT NULL,
  ordre      INT             DEFAULT 0,
  PRIMARY KEY (path_id, course_id),
  FOREIGN KEY (path_id)   REFERENCES paths(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id)  ON DELETE CASCADE,
  INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pivot cours ↔ tag
CREATE TABLE IF NOT EXISTS course_tag (
  course_id BIGINT UNSIGNED NOT NULL,
  tag_id    BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (course_id, tag_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)    REFERENCES tags(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Validation / refus des cours par l'Admin
CREATE TABLE IF NOT EXISTS course_validations (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  course_id   BIGINT UNSIGNED  NOT NULL,
  admin_id    BIGINT UNSIGNED  NOT NULL,
  decision    ENUM('approved','rejected') NOT NULL,
  commentaire TEXT             NULL COMMENT 'Motif de refus ou remarque Admin',
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id)  REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Traçabilité des validations de cours par Admin (souveraineté)';

-- Notes et avis sur les cours (évaluations apprenants)
CREATE TABLE IF NOT EXISTS course_reviews (
  id         BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  course_id  BIGINT UNSIGNED  NOT NULL,
  user_id    BIGINT UNSIGNED  NOT NULL,
  note       TINYINT UNSIGNED NOT NULL COMMENT 'Note de 1 à 5',
  commentaire TEXT            NULL,
  created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  UNIQUE KEY unique_review (user_id, course_id),
  CHECK (note BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DOMAINE 3 : CONTENU PÉDAGOGIQUE
-- Tables : sections, lessons, resources
-- =============================================================

-- Sections (chapitres) d'un cours
CREATE TABLE IF NOT EXISTS sections (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  course_id   BIGINT UNSIGNED  NOT NULL,
  titre       VARCHAR(255)     NOT NULL,
  description TEXT             NULL,
  ordre       INT              DEFAULT 0,
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sections / chapitres d un cours';

-- Leçons (unité atomique de contenu)
CREATE TABLE IF NOT EXISTS lessons (
  id           BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  section_id   BIGINT UNSIGNED  NOT NULL,
  course_id    BIGINT UNSIGNED  NOT NULL COMMENT 'Dénormalisé pour requêtes rapides',
  titre        VARCHAR(255)     NOT NULL,
  slug         VARCHAR(255)     NOT NULL,
  description  LONGTEXT         NULL,
  contenu      LONGTEXT         NULL COMMENT 'Contenu texte HTML/Markdown',
  duree        INT              NULL COMMENT 'Durée estimée en minutes',
  ordre        INT              DEFAULT 0,
  is_free      BOOLEAN          DEFAULT FALSE COMMENT 'Leçon prévisualisable sans inscription',
  status       ENUM('draft','published') DEFAULT 'draft',
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
  UNIQUE KEY unique_lesson_slug (course_id, slug),
  INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Leçon — unité atomique de contenu';

-- Ressources pédagogiques (video, PDF, lien, mini-projet)
CREATE TABLE IF NOT EXISTS resources (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  lesson_id   BIGINT UNSIGNED  NOT NULL,
  type        ENUM('video','pdf','lien','mini_projet','audio','image') NOT NULL,
  titre       VARCHAR(255)     NOT NULL,
  url         VARCHAR(1000)    NOT NULL COMMENT 'URL locale (MinIO) ou externe',
  taille_ko   INT UNSIGNED     NULL  COMMENT 'Taille fichier en ko (pour les fichiers locaux)',
  duree_sec   INT UNSIGNED     NULL  COMMENT 'Durée en secondes (pour vidéo/audio)',
  ordre       INT              DEFAULT 0,
  is_telechar BOOLEAN          DEFAULT FALSE COMMENT 'Téléchargeable hors ligne',
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  INDEX idx_type  (type),
  INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Ressource — composition de Leçon';


-- =============================================================
-- DOMAINE 4 : INSCRIPTIONS & PROGRESSION
-- Tables : enrollments, path_enrollments, lesson_progress,
--          sessions_travail
-- =============================================================

-- Inscriptions à un cours
CREATE TABLE IF NOT EXISTS enrollments (
  id              BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED  NOT NULL,
  course_id       BIGINT UNSIGNED  NOT NULL,
  enrolled_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP        NULL,
  progression     DECIMAL(5,2)     DEFAULT 0.00 COMMENT 'Pourcentage de complétion 0–100',
  derniere_lecon  BIGINT UNSIGNED  NULL COMMENT 'Dernière leçon consultée (reprise)',
  status          ENUM('active','completed','dropped') DEFAULT 'active',
  created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)         REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (course_id)       REFERENCES courses(id)   ON DELETE CASCADE,
  FOREIGN KEY (derniere_lecon)  REFERENCES lessons(id)   ON DELETE SET NULL,
  UNIQUE KEY unique_enrollment (user_id, course_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Inscription — association Apprenant ↔ Cours';

-- Inscriptions à un parcours
CREATE TABLE IF NOT EXISTS path_enrollments (
  id           BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED  NOT NULL,
  path_id      BIGINT UNSIGNED  NOT NULL,
  enrolled_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP        NULL,
  progression  DECIMAL(5,2)     DEFAULT 0.00,
  status       ENUM('active','completed','dropped') DEFAULT 'active',
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (path_id) REFERENCES paths(id)  ON DELETE CASCADE,
  UNIQUE KEY unique_path_enrollment (user_id, path_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Inscription à un Parcours';

-- Suivi de progression par leçon
CREATE TABLE IF NOT EXISTS lesson_progress (
  id             BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED  NOT NULL,
  lesson_id      BIGINT UNSIGNED  NOT NULL,
  enrollment_id  BIGINT UNSIGNED  NOT NULL,
  completed      BOOLEAN          DEFAULT FALSE,
  completed_at   TIMESTAMP        NULL,
  temps_passe    INT UNSIGNED     DEFAULT 0 COMMENT 'Secondes passées sur la leçon',
  created_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (lesson_id)     REFERENCES lessons(id)     ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_lesson_progress (user_id, lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Session — suivi granulaire par leçon';

-- Sessions de travail (historique connexion/cours)
CREATE TABLE IF NOT EXISTS work_sessions (
  id           BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED  NOT NULL,
  course_id    BIGINT UNSIGNED  NULL,
  lesson_id    BIGINT UNSIGNED  NULL,
  debut        TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  fin          TIMESTAMP        NULL,
  duree_min    INT UNSIGNED     DEFAULT 0 COMMENT 'Durée calculée en minutes',
  ip_address   VARCHAR(45)      NULL,
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id)  ON DELETE SET NULL,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)  ON DELETE SET NULL,
  INDEX idx_user_id  (user_id),
  INDEX idx_debut    (debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Session — historique de travail (tableau de bord)';


-- =============================================================
-- DOMAINE 5 : ÉVALUATION — QUIZ & DEVOIRS
-- Tables : assessments, questions, question_answers,
--          submissions, student_answers, quiz_results
-- =============================================================

-- Évaluations (quiz ou devoir)
CREATE TABLE IF NOT EXISTS assessments (
  id              BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  course_id       BIGINT UNSIGNED  NOT NULL,
  lesson_id       BIGINT UNSIGNED  NULL COMMENT 'NULL si quiz de fin de cours',
  titre           VARCHAR(255)     NOT NULL,
  description     LONGTEXT         NULL,
  type            ENUM('quiz','devoir','projet') DEFAULT 'quiz',
  score_max       INT              DEFAULT 100,
  score_passage   INT              DEFAULT 70  COMMENT 'Score minimum pour valider',
  tentatives_max  INT              DEFAULT 3   COMMENT '0 = illimité',
  duree_minutes   INT              NULL        COMMENT 'Durée limite du quiz (NULL = pas de limite)',
  ordre           INT              DEFAULT 0,
  status          ENUM('draft','published') DEFAULT 'draft',
  created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)  ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Quiz / Évaluation';

-- Questions d'un quiz
CREATE TABLE IF NOT EXISTS questions (
  id              BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  assessment_id   BIGINT UNSIGNED  NOT NULL,
  enonce          LONGTEXT         NOT NULL,
  type            ENUM('qcm','vrai_faux','reponse_courte','essai') DEFAULT 'qcm',
  points          INT              DEFAULT 1,
  explication     LONGTEXT         NULL COMMENT 'Explication affichée après la correction',
  ordre           INT              DEFAULT 0,
  created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Question';

-- Réponses possibles (QCM)
CREATE TABLE IF NOT EXISTS question_answers (
  id           BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  question_id  BIGINT UNSIGNED  NOT NULL,
  texte        LONGTEXT         NOT NULL,
  est_correcte BOOLEAN          DEFAULT FALSE,
  ordre        INT              DEFAULT 0,
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_est_correcte (est_correcte)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Reponse';

-- Soumissions des apprenants
CREATE TABLE IF NOT EXISTS submissions (
  id             BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED  NOT NULL,
  assessment_id  BIGINT UNSIGNED  NOT NULL,
  tentative_num  TINYINT UNSIGNED DEFAULT 1,
  score          DECIMAL(6,2)     NULL,
  status         ENUM('en_cours','soumis','corrige','revu') DEFAULT 'en_cours',
  debut_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  soumis_at      TIMESTAMP        NULL,
  corrige_at     TIMESTAMP        NULL,
  feedback       LONGTEXT         NULL COMMENT 'Feedback formateur (devoirs/projets)',
  created_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
  FOREIGN KEY (assessment_id)  REFERENCES assessments(id)   ON DELETE CASCADE,
  UNIQUE KEY unique_submission (user_id, assessment_id, tentative_num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Soumission';

-- Réponses données par l'apprenant
CREATE TABLE IF NOT EXISTS student_answers (
  id             BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  submission_id  BIGINT UNSIGNED  NOT NULL,
  question_id    BIGINT UNSIGNED  NOT NULL,
  answer_id      BIGINT UNSIGNED  NULL COMMENT 'Réponse choisie (QCM / vrai-faux)',
  texte_libre    LONGTEXT         NULL COMMENT 'Réponse saisie (essai / réponse courte)',
  est_correcte   BOOLEAN          DEFAULT FALSE,
  points_obtenus DECIMAL(5,2)     DEFAULT 0,
  created_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)      ON DELETE CASCADE,
  FOREIGN KEY (question_id)   REFERENCES questions(id)        ON DELETE CASCADE,
  FOREIGN KEY (answer_id)     REFERENCES question_answers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Réponses apprenant par question';

-- Résultats quiz agrégés (classe ResultatQuiz)
CREATE TABLE IF NOT EXISTS quiz_results (
  id              BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED  NOT NULL,
  assessment_id   BIGINT UNSIGNED  NOT NULL,
  submission_id   BIGINT UNSIGNED  NOT NULL,
  score           DECIMAL(6,2)     NOT NULL,
  score_max       INT              NOT NULL,
  est_reussi      BOOLEAN          DEFAULT FALSE,
  tentative_num   TINYINT UNSIGNED DEFAULT 1,
  duree_sec       INT UNSIGNED     NULL COMMENT 'Durée réelle de passage en secondes',
  soumis_at       TIMESTAMP        NOT NULL,
  created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)        ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)   ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)   ON DELETE CASCADE,
  INDEX idx_user_quiz (user_id, assessment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe ResultatQuiz — suivi des tentatives';


-- =============================================================
-- DOMAINE 6 : CERTIFICATS & BADGES (GAMIFICATION)
-- =============================================================

-- Certificats de complétion
CREATE TABLE IF NOT EXISTS certificates (
  id            BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED  NOT NULL,
  course_id     BIGINT UNSIGNED  NULL,
  path_id       BIGINT UNSIGNED  NULL,
  numero_serie  VARCHAR(100)     NOT NULL UNIQUE COMMENT 'Identifiant public vérifiable',
  url_pdf       VARCHAR(500)     NULL COMMENT 'URL du certificat PDF (stockage local MinIO)',
  emis_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id)  ON DELETE SET NULL,
  FOREIGN KEY (path_id)   REFERENCES paths(id)    ON DELETE SET NULL,
  INDEX idx_numero (numero_serie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Badges de gamification
CREATE TABLE IF NOT EXISTS badges (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  nom         VARCHAR(100)     NOT NULL UNIQUE,
  description TEXT             NULL,
  icone       VARCHAR(500)     NULL,
  critere     TEXT             NULL COMMENT 'Description du critère d attribution',
  xp_valeur   INT UNSIGNED     DEFAULT 0 COMMENT 'Points XP accordés avec ce badge',
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attribution de badges aux apprenants
CREATE TABLE IF NOT EXISTS user_badges (
  id         BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED  NOT NULL,
  badge_id   BIGINT UNSIGNED  NOT NULL,
  obtenu_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_badge (user_id, badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DOMAINE 7 : COMMUNICATION & NOTIFICATIONS
-- =============================================================

-- Notifications in-app
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED  NOT NULL,
  type       VARCHAR(100)     NOT NULL COMMENT 'course_published | quiz_graded | certificate_issued …',
  titre      VARCHAR(255)     NOT NULL,
  message    TEXT             NOT NULL,
  data       JSON             NULL COMMENT 'Payload JSON (liens, IDs référencés)',
  lu_at      TIMESTAMP        NULL,
  created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_lu        (lu_at),
  INDEX idx_created   (created_at),
  INDEX idx_user_type (user_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe Notification';

-- Messagerie interne formateur ↔ apprenant
CREATE TABLE IF NOT EXISTS messages (
  id           BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  expediteur_id BIGINT UNSIGNED NOT NULL,
  destinataire_id BIGINT UNSIGNED NOT NULL,
  course_id    BIGINT UNSIGNED  NULL COMMENT 'Contexte : cours concerné',
  sujet        VARCHAR(255)     NULL,
  corps        TEXT             NOT NULL,
  lu_at        TIMESTAMP        NULL,
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expediteur_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (destinataire_id) REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id)       REFERENCES courses(id)  ON DELETE SET NULL,
  INDEX idx_destinataire (destinataire_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annonces formateur dans un cours
CREATE TABLE IF NOT EXISTS announcements (
  id         BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  course_id  BIGINT UNSIGNED  NOT NULL,
  auteur_id  BIGINT UNSIGNED  NOT NULL,
  titre      VARCHAR(255)     NOT NULL,
  corps      TEXT             NOT NULL,
  created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (auteur_id) REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forum / Questions & Réponses par cours
CREATE TABLE IF NOT EXISTS forum_posts (
  id           BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  course_id    BIGINT UNSIGNED  NOT NULL,
  lesson_id    BIGINT UNSIGNED  NULL,
  auteur_id    BIGINT UNSIGNED  NOT NULL,
  parent_id    BIGINT UNSIGNED  NULL COMMENT 'NULL = question ; sinon = réponse',
  titre        VARCHAR(255)     NULL COMMENT 'Uniquement pour les questions (parent_id NULL)',
  corps        TEXT             NOT NULL,
  epingle      BOOLEAN          DEFAULT FALSE,
  resolu       BOOLEAN          DEFAULT FALSE,
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)     ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)     ON DELETE SET NULL,
  FOREIGN KEY (auteur_id) REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  INDEX idx_course_lesson (course_id, lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DOMAINE 8 : SOUVERAINETÉ — AUDIT & SÉCURITÉ
-- Tables : audit_logs, gdpr_requests
-- =============================================================

-- Logs d'audit — traçabilité complète (classe LogAudit)
CREATE TABLE IF NOT EXISTS audit_logs (
  id           BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED  NULL COMMENT 'NULL si action système non authentifiée',
  action       VARCHAR(100)     NOT NULL COMMENT 'login | logout | enroll | submit_quiz | delete_user …',
  module       VARCHAR(100)     NOT NULL COMMENT 'auth | cours | quiz | admin | user …',
  resource_type VARCHAR(100)    NULL COMMENT 'Table / entité concernée',
  resource_id  BIGINT UNSIGNED  NULL COMMENT 'ID de la ressource concernée',
  ancien_etat  JSON             NULL COMMENT 'État avant modification (audit trail complet)',
  nouvel_etat  JSON             NULL COMMENT 'État après modification',
  ip_address   VARCHAR(45)      NOT NULL,
  user_agent   TEXT             NULL,
  statut       ENUM('success','failure','warning') DEFAULT 'success',
  detail       TEXT             NULL COMMENT 'Message d erreur si failure',
  created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id    (user_id),
  INDEX idx_action     (action),
  INDEX idx_module     (module),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Classe LogAudit — SOUVERAINETÉ — conformité loi sénégalaise n°2008-12';

-- Demandes RGPD / CDP Sénégal (droit d'accès, suppression)
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED  NOT NULL,
  type        ENUM('access','delete','rectify','portability') NOT NULL,
  statut      ENUM('pending','processing','completed','rejected') DEFAULT 'pending',
  detail      TEXT             NULL,
  traite_par  BIGINT UNSIGNED  NULL COMMENT 'Admin qui a traité la demande',
  traite_at   TIMESTAMP        NULL,
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (traite_par) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Conformité loi n°2008-12 sur les données personnelles (Sénégal)';

-- Fichiers uploadés (stockage local MinIO — souveraineté)
CREATE TABLE IF NOT EXISTS media_files (
  id            BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  uploader_id   BIGINT UNSIGNED  NOT NULL,
  nom_original  VARCHAR(500)     NOT NULL,
  nom_stockage  VARCHAR(500)     NOT NULL COMMENT 'Nom unique côté MinIO',
  mime_type     VARCHAR(100)     NOT NULL,
  taille_ko     INT UNSIGNED     NOT NULL,
  bucket        VARCHAR(100)     DEFAULT 'edaara' COMMENT 'Bucket MinIO',
  url_locale    VARCHAR(1000)    NOT NULL COMMENT 'URL interne MinIO — pas de cloud US',
  context_type  VARCHAR(100)     NULL COMMENT 'Table qui référence ce fichier',
  context_id    BIGINT UNSIGNED  NULL,
  created_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_context (context_type, context_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Stockage fichiers local MinIO — souveraineté numérique';


-- =============================================================
-- DOMAINE 9 : ADMINISTRATION & CONFIGURATION
-- =============================================================

-- Paramètres globaux de la plateforme
CREATE TABLE IF NOT EXISTS settings (
  id          BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  cle         VARCHAR(255)     NOT NULL UNIQUE,
  valeur      TEXT             NULL,
  groupe      VARCHAR(100)     DEFAULT 'general',
  description TEXT             NULL,
  updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Paramètres configurables de la plateforme (admin)';

-- Statistiques agrégées pré-calculées (performance dashboard)
CREATE TABLE IF NOT EXISTS stats_snapshots (
  id                 BIGINT UNSIGNED  PRIMARY KEY AUTO_INCREMENT,
  snap_date          DATE             NOT NULL,
  total_users        INT UNSIGNED     DEFAULT 0,
  total_apprenants   INT UNSIGNED     DEFAULT 0,
  total_formateurs   INT UNSIGNED     DEFAULT 0,
  total_cours        INT UNSIGNED     DEFAULT 0,
  total_inscriptions INT UNSIGNED     DEFAULT 0,
  total_completions  INT UNSIGNED     DEFAULT 0,
  total_quizzes      INT UNSIGNED     DEFAULT 0,
  created_at         TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_snap_date (snap_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Snapshots quotidiens pour le tableau de bord Admin';


-- =============================================================
-- DONNÉES INITIALES (seed)
-- =============================================================

-- Rôles
INSERT IGNORE INTO roles (name, description) VALUES
  ('admin',      'Administrateur — accès complet à la plateforme'),
  ('instructor', 'Formateur — crée et gère ses cours'),
  ('student',    'Apprenant — suit les cours et passe les quiz'),
  ('visitor',    'Visiteur non authentifié — accès catalogue seulement');

-- Permissions atomiques
INSERT IGNORE INTO permissions (name, module, description) VALUES
  ('view_dashboard',       'admin',    'Voir le tableau de bord admin'),
  ('manage_users',         'admin',    'Gérer les utilisateurs (CRUD)'),
  ('manage_roles',         'admin',    'Gérer les rôles et permissions'),
  ('view_audit_logs',      'admin',    'Consulter les logs d audit'),
  ('manage_settings',      'admin',    'Modifier les paramètres plateforme'),
  ('validate_course',      'admin',    'Valider ou refuser un cours'),
  ('view_reports',         'admin',    'Voir les statistiques globales'),
  ('create_course',        'cours',    'Créer un cours'),
  ('edit_own_course',      'cours',    'Modifier ses propres cours'),
  ('delete_own_course',    'cours',    'Supprimer ses propres cours'),
  ('publish_course',       'cours',    'Soumettre un cours à validation'),
  ('create_path',          'cours',    'Créer un parcours'),
  ('manage_assessments',   'quiz',     'Créer et gérer les quiz'),
  ('view_student_results', 'quiz',     'Voir les résultats des apprenants'),
  ('enroll_course',        'student',  'S inscrire à un cours'),
  ('submit_assessment',    'student',  'Soumettre un quiz'),
  ('view_own_progress',    'student',  'Voir sa propre progression'),
  ('request_gdpr',         'gdpr',     'Faire une demande RGPD / CDP');

-- Catégories initiales
INSERT IGNORE INTO categories (name, slug, description, icon, couleur) VALUES
  ('Informatique & Programmation', 'informatique-programmation', 'Développement web, mobile et logiciel', 'code', '#3B82F6'),
  ('Mathématiques & Sciences',     'mathematiques-sciences',     'Algèbre, analyse, physique, chimie',      'calculator', '#10B981'),
  ('Langues & Communication',      'langues-communication',      'Français, Anglais, Wolof, Arabe…',        'language', '#F59E0B'),
  ('Management & Entrepreneuriat', 'management-entrepreneuriat', 'Gestion, création d entreprise en Afrique','briefcase', '#8B5CF6'),
  ('Santé & Bien-être',            'sante-bien-etre',            'Santé publique, nutrition, hygiène',       'heart', '#EF4444'),
  ('Agriculture & Environnement',  'agriculture-environnement',  'Agroécologie, gestion des ressources',    'leaf', '#84CC16'),
  ('Culture & Humanités',          'culture-humanites',          'Histoire africaine, philosophie, arts',   'book', '#F97316');

-- Paramètres par défaut
INSERT IGNORE INTO settings (cle, valeur, groupe, description) VALUES
  ('site_name',             'E-Daara',    'general', 'Nom de la plateforme'),
  ('site_url',              '',           'general', 'URL publique'),
  ('maintenance_mode',      '0',          'general', 'Mode maintenance (0=off, 1=on)'),
  ('allow_registration',    '1',          'auth',    'Autoriser l inscription publique'),
  ('oauth_google_enabled',  '1',          'auth',    'Activer la connexion Google'),
  ('oauth_facebook_enabled','1',          'auth',    'Activer la connexion Facebook'),
  ('jwt_expiration_min',    '60',         'security','Durée access token JWT en minutes'),
  ('refresh_token_days',    '30',         'security','Durée refresh token en jours'),
  ('max_upload_size_mo',    '500',        'media',   'Taille max upload fichier en Mo'),
  ('storage_driver',        'minio',      'media',   'Driver stockage : local | minio'),
  ('rgpd_contact_email',    '',           'gdpr',    'Email contact RGPD / CDP'),
  ('hebergement_pays',      'Sénégal',    'sovereignty','Pays d hébergement (souveraineté)'),
  ('data_residency',        'local',      'sovereignty','Résidence des données : local | africain');
