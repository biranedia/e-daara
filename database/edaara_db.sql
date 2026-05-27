-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 27 mai 2026 à 19:09
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `edaara_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `auteur_id` bigint(20) UNSIGNED NOT NULL,
  `titre` varchar(255) NOT NULL,
  `corps` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `assessments`
--

CREATE TABLE `assessments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'NULL si quiz de fin de cours',
  `titre` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `type` enum('quiz','devoir','projet') DEFAULT 'quiz',
  `score_max` int(11) DEFAULT 100,
  `score_passage` int(11) DEFAULT 70 COMMENT 'Score minimum pour valider',
  `tentatives_max` int(11) DEFAULT 3 COMMENT '0 = illimité',
  `duree_minutes` int(11) DEFAULT NULL COMMENT 'Durée limite du quiz (NULL = pas de limite)',
  `ordre` int(11) DEFAULT 0,
  `status` enum('draft','published') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Quiz / Évaluation';

-- --------------------------------------------------------

--
-- Structure de la table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'NULL si action système non authentifiée',
  `action` varchar(100) NOT NULL COMMENT 'login | logout | enroll | submit_quiz | delete_user …',
  `module` varchar(100) NOT NULL COMMENT 'auth | cours | quiz | admin | user …',
  `resource_type` varchar(100) DEFAULT NULL COMMENT 'Table / entité concernée',
  `resource_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID de la ressource concernée',
  `ancien_etat` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'État avant modification (audit trail complet)' CHECK (json_valid(`ancien_etat`)),
  `nouvel_etat` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'État après modification' CHECK (json_valid(`nouvel_etat`)),
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `statut` enum('success','failure','warning') DEFAULT 'success',
  `detail` text DEFAULT NULL COMMENT 'Message d erreur si failure',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe LogAudit — SOUVERAINETÉ — conformité loi sénégalaise n°2008-12';

--
-- Déchargement des données de la table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `module`, `resource_type`, `resource_id`, `ancien_etat`, `nouvel_etat`, `ip_address`, `user_agent`, `statut`, `detail`, `created_at`) VALUES
(1, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:45:59'),
(2, 1, 'CREATE_COURSE', 'cours', 'courses', 8, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:49:41'),
(3, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:49:41'),
(4, 1, 'UPDATE_COURSE', 'cours', 'courses', 8, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:49:41'),
(5, 1, 'PUT /8', 'system', NULL, 8, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:49:41'),
(6, 1, 'DELETE_COURSE', 'cours', 'courses', 8, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:49:41'),
(7, 1, 'DELETE /8', 'system', NULL, 8, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:49:41'),
(8, 1, 'CREATE_COURSE', 'cours', 'courses', 10, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:52:43'),
(9, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:52:43'),
(10, 1, 'UPDATE_COURSE', 'cours', 'courses', 10, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:52:43'),
(11, 1, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:52:43'),
(12, 1, 'DELETE_COURSE', 'cours', 'courses', 10, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:52:43'),
(13, 1, 'DELETE /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:52:43'),
(14, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:33'),
(15, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(16, 1, 'CREATE_COURSE', 'cours', 'courses', 11, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(17, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(18, 1, 'UPDATE_COURSE', 'cours', 'courses', 11, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(19, 1, 'PUT /11', 'system', NULL, 11, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(20, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(21, 1, 'PUT /users/2/status', '2', '2', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(22, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(23, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(24, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:54:34'),
(25, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:16'),
(26, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(27, 1, 'CREATE_COURSE', 'cours', 'courses', 12, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(28, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(29, 1, 'UPDATE_COURSE', 'cours', 'courses', 12, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(30, 1, 'PUT /12', 'system', NULL, 12, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(31, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 3, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(32, 1, 'PUT /users/3/status', '3', '3', 3, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(33, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(34, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(35, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:17'),
(36, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(37, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(38, 1, 'CREATE_COURSE', 'cours', 'courses', 13, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(39, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(40, 1, 'UPDATE_COURSE', 'cours', 'courses', 13, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(41, 1, 'PUT /13', 'system', NULL, 13, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(42, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 4, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(43, 1, 'PUT /users/4/status', '4', '4', 4, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(44, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:53'),
(45, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:54'),
(46, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:55:54'),
(47, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:08'),
(48, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(49, 1, 'CREATE_COURSE', 'cours', 'courses', 14, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(50, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(51, 1, 'UPDATE_COURSE', 'cours', 'courses', 14, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(52, 1, 'PUT /14', 'system', NULL, 14, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(53, 1, 'DELETE_COURSE', 'cours', 'courses', 14, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(54, 1, 'DELETE /14', 'system', NULL, 14, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(55, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(56, 1, 'PUT /users/2/status', '2', '2', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(57, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(58, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(59, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 17:58:09'),
(60, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:38'),
(61, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(62, 1, 'CREATE_COURSE', 'cours', 'courses', 15, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(63, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(64, 1, 'UPDATE_COURSE', 'cours', 'courses', 15, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(65, 1, 'PUT /15', 'system', NULL, 15, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(66, 1, 'DELETE_COURSE', 'cours', 'courses', 15, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(67, 1, 'DELETE /15', 'system', NULL, 15, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(68, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(69, 1, 'PUT /users/2/status', '2', '2', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(70, 1, 'CREATE_PATH', 'cours', 'paths', 1, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(71, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(72, 1, 'ENROLL_COURSE', 'student', 'enrollments', 1, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(73, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(74, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:14:39'),
(75, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:32'),
(76, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(77, 1, 'CREATE_COURSE', 'cours', 'courses', 16, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(78, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(79, 1, 'UPDATE_COURSE', 'cours', 'courses', 16, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(80, 1, 'PUT /16', 'system', NULL, 16, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(81, 1, 'DELETE_COURSE', 'cours', 'courses', 16, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(82, 1, 'DELETE /16', 'system', NULL, 16, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(83, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(84, 1, 'PUT /users/2/status', '2', '2', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(85, 1, 'CREATE_PATH', 'cours', 'paths', 3, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(86, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(87, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(88, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:33'),
(89, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(90, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(91, 1, 'CREATE_COURSE', 'cours', 'courses', 17, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(92, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(93, 1, 'UPDATE_COURSE', 'cours', 'courses', 17, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(94, 1, 'PUT /17', 'system', NULL, 17, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(95, 1, 'DELETE_COURSE', 'cours', 'courses', 17, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(96, 1, 'DELETE /17', 'system', NULL, 17, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(97, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(98, 1, 'PUT /users/2/status', '2', '2', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(99, 1, 'CREATE_PATH', 'cours', 'paths', 5, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(100, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(101, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(102, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:16:50'),
(103, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:52'),
(104, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(105, 1, 'CREATE_COURSE', 'cours', 'courses', 18, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(106, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(107, 1, 'UPDATE_COURSE', 'cours', 'courses', 18, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(108, 1, 'PUT /18', 'system', NULL, 18, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(109, 1, 'DELETE_COURSE', 'cours', 'courses', 18, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(110, 1, 'DELETE /18', 'system', NULL, 18, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(111, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(112, 1, 'PUT /users/2/status', '2', '2', 2, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(113, 1, 'CREATE_PATH', 'cours', 'paths', 7, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(114, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(115, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(116, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:20:53'),
(117, 1, 'CREATE_ASSESSMENT', 'quiz', 'assessments', 1, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:26:55'),
(118, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:26:55'),
(119, 1, 'CREATE_QUESTION', 'quiz', 'questions', 1, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:26:55'),
(120, 1, 'POST /1/questions', 'questions', 'questions', 1, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:26:55'),
(121, 1, 'CREATE_QUESTION_ANSWER', 'quiz', 'question_answers', 3, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:26:55'),
(122, 1, 'POST /questions/1/answers', '1', '1', NULL, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:26:55'),
(123, 1, 'DELETE_ASSESSMENT', 'quiz', 'assessments', 1, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:26:55'),
(124, 1, 'DELETE /1', 'system', NULL, 1, NULL, NULL, '127.0.0.1', 'axios/1.16.1', 'success', NULL, '2026-05-17 18:26:55'),
(125, 1, 'REFRESH_STATS_SNAPSHOT', 'admin', 'stats_snapshots', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:37:43'),
(126, 1, 'POST /refresh', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:37:43'),
(127, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:40:11'),
(128, 1, 'PUT /users/9/status', '9', '9', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:40:11'),
(129, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:40:18'),
(130, 1, 'PUT /users/9/status', '9', '9', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:40:18'),
(131, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:54:14'),
(132, 1, 'PUT /users/9/status', '9', '9', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:54:14'),
(133, 1, 'UPDATE_USER_STATUS', 'admin', 'users', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:54:22'),
(134, 1, 'PUT /users/9/status', '9', '9', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 21:54:22'),
(135, 1, 'UPSERT_SETTING', 'admin', 'settings', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:08:01'),
(136, 1, 'PUT /oauth_facebook_enabled', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:08:02'),
(137, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:20:45'),
(138, 1, 'POST /change-password', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:21:37'),
(139, 1, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:22:14'),
(140, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:22:14'),
(141, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:23:34'),
(142, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:30:41'),
(143, NULL, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:41:09'),
(144, NULL, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:41:56'),
(145, 1, 'UPDATE_USER_ROLES', 'admin', 'users', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:42:17'),
(146, 1, 'PUT /users/10/roles', '10', '10', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:42:17'),
(147, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:42:36'),
(148, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:23'),
(149, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:25'),
(150, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:26'),
(151, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:28'),
(152, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:31'),
(153, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:32'),
(154, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:32'),
(155, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:33'),
(156, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:33'),
(157, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:33'),
(158, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:33'),
(159, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:33'),
(160, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:44:59'),
(161, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:45:00'),
(162, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:45:00'),
(163, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:45:00'),
(164, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:45:00'),
(165, NULL, 'CREATE_PATH', 'cours', 'paths', 8, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:52:55'),
(166, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:52:55'),
(167, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:53:23'),
(168, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:53:23'),
(169, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:53:23'),
(170, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:53:23'),
(171, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:53:24'),
(172, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:53:53'),
(173, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:53:59'),
(174, NULL, 'SEND_MESSAGE', 'communication', 'messages', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:55:06'),
(175, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:55:06'),
(176, NULL, 'PUT /1/read', 'read', 'read', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:55:22'),
(177, NULL, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:55:54'),
(178, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:55:54'),
(179, NULL, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:58:57'),
(180, 1, 'UPDATE_USER_ROLES', 'admin', 'users', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:59:09'),
(181, 1, 'PUT /users/10/roles', '10', '10', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:59:09'),
(182, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 22:59:14'),
(183, NULL, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:00:41'),
(184, 1, 'PUT /1/read', 'read', 'read', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:00:52'),
(185, 1, 'SEND_MESSAGE', 'communication', 'messages', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:01:02'),
(186, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:01:02'),
(187, 1, 'PUT /2/read', 'read', 'read', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:01:09'),
(188, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:01:48'),
(189, 1, 'UPDATE_USER_ROLES', 'admin', 'users', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:01:58'),
(190, 1, 'PUT /users/10/roles', '10', '10', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:01:58'),
(191, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:02:40'),
(192, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:03:06'),
(193, NULL, 'CREATE_COURSE', 'cours', 'courses', 19, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:03:40'),
(194, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:03:40'),
(195, NULL, 'CREATE_SECTION', 'cours', 'sections', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:04:07'),
(196, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:04:07'),
(197, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:04:31'),
(198, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:04:36'),
(199, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:04:41'),
(200, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:04:45'),
(201, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:04:48'),
(202, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:06:33'),
(203, NULL, 'CREATE_SECTION', 'cours', 'sections', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:10:04'),
(204, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:10:04'),
(205, NULL, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:15:59'),
(206, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:16:28'),
(207, NULL, 'SUBMIT_COURSE_FOR_REVIEW', 'cours', 'courses', 19, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:16:36'),
(208, NULL, 'POST /19/submit', 'submit', 'submit', 19, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:16:36'),
(209, NULL, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:16:44'),
(210, 1, 'POST /courses/19/validate', '19', '19', 19, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:17:22'),
(211, 1, 'POST /courses/19/validate', '19', '19', 19, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:17:26'),
(212, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:18:15'),
(213, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:18:44'),
(214, NULL, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:18:55'),
(215, NULL, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:19:20'),
(216, 1, 'UPDATE_USER_ROLES', 'admin', 'users', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:19:31'),
(217, 1, 'PUT /users/10/roles', '10', '10', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:19:31'),
(218, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:19:32'),
(219, NULL, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-24 23:22:23'),
(220, 1, 'DELETE_USER', 'admin', 'users', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:27:43'),
(221, 1, 'DELETE /users/10', '10', '10', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:27:43'),
(222, 1, 'POST /users', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:32:41'),
(223, 1, 'POST /users', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:33:37'),
(224, 1, 'CREATE_USER', 'admin', 'users', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:34:43'),
(225, 1, 'POST /users', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:34:43'),
(226, 1, 'UPDATE_USER', 'admin', 'users', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:35:35'),
(227, 1, 'PUT /users/11', '11', '11', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:35:35'),
(228, 1, 'UPDATE_USER', 'admin', 'users', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:36:23'),
(229, 1, 'PUT /users/11', '11', '11', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:36:23'),
(230, 11, 'CREATE_PATH', 'cours', 'paths', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-26 13:37:18'),
(231, 11, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-26 13:37:18'),
(232, 1, 'CREATE_BADGE', 'gamification', 'badges', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:54:54'),
(233, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 13:54:54'),
(234, 1, 'UPDATE_USER', 'admin', 'users', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 14:32:57'),
(235, 1, 'PUT /users/11', '11', '11', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 14:32:57'),
(236, 1, 'UPDATE_USER_ROLES', 'admin', 'users', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 14:32:57'),
(237, 1, 'PUT /users/11/roles', '11', '11', 11, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-26 14:32:57'),
(238, 11, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-26 14:33:56'),
(239, 1, 'POST /avatar', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 00:55:02'),
(240, 1, 'POST /avatar', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 00:55:09'),
(241, 1, 'POST /avatar', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 00:55:24'),
(242, 1, 'POST /avatar', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 00:55:30'),
(243, 1, 'POST /avatar', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 00:59:48'),
(244, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:06:46'),
(245, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:06:54'),
(246, 1, 'SEND_MESSAGE', 'communication', 'messages', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:08:08'),
(247, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:08:08'),
(248, 11, 'PUT /3/read', 'read', 'read', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:08:34'),
(249, 11, 'SEND_MESSAGE', 'communication', 'messages', 4, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:09:05'),
(250, 11, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:09:05'),
(251, 1, 'PUT /3/read', 'read', 'read', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:09:35'),
(252, 1, 'PUT /4/read', 'read', 'read', 4, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:09:46'),
(253, 11, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:22:36'),
(254, 11, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:25:37'),
(255, 11, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:26:31'),
(256, 11, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:26:32'),
(257, 1, 'DELETE_USER', 'admin', 'users', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:27:43'),
(258, 1, 'DELETE /users/2', '2', '2', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:27:43'),
(259, 1, 'DELETE_USER', 'admin', 'users', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:27:49'),
(260, 1, 'DELETE /users/3', '3', '3', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:27:49'),
(261, 1, 'DELETE_USER', 'admin', 'users', 4, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:27:52'),
(262, 1, 'DELETE /users/4', '4', '4', 4, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:27:52'),
(263, 1, 'UPDATE_USER', 'admin', 'users', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:31:08'),
(264, 1, 'PUT /users/9', '9', '9', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:31:08'),
(265, 1, 'UPDATE_USER_ROLES', 'admin', 'users', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:31:08'),
(266, 1, 'PUT /users/9/roles', '9', '9', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 01:31:08'),
(267, 9, 'CREATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:35:14');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `module`, `resource_type`, `resource_id`, `ancien_etat`, `nouvel_etat`, `ip_address`, `user_agent`, `statut`, `detail`, `created_at`) VALUES
(268, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:35:14'),
(269, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:35:24'),
(270, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:35:35'),
(271, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:35:49'),
(272, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:40:29'),
(273, 9, 'CREATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:40:54'),
(274, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:40:54'),
(275, 9, 'CREATE_SECTION', 'cours', 'sections', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:41:43'),
(276, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:41:43'),
(277, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 01:42:22'),
(278, 1, 'DELETE_USER', 'admin', 'users', 8, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 11:50:47'),
(279, 1, 'DELETE /users/8', '8', '8', 8, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 11:50:47'),
(280, 1, 'DELETE_USER', 'admin', 'users', 7, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 11:50:54'),
(281, 1, 'DELETE /users/7', '7', '7', 7, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 11:50:54'),
(282, 1, 'DELETE_USER', 'admin', 'users', 6, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 11:50:58'),
(283, 1, 'DELETE /users/6', '6', '6', 6, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 11:50:58'),
(284, 1, 'POST /avatar', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 11:54:09'),
(285, 1, 'PUT /profile', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 11:54:14'),
(286, 1, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:04:39'),
(287, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:04:39'),
(288, 1, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 4, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:07:24'),
(289, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:07:24'),
(290, 1, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 5, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:07:33'),
(291, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:07:33'),
(292, 1, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 6, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:07:42'),
(293, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:07:42'),
(294, 1, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 7, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:08:43'),
(295, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:08:43'),
(296, 1, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 8, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:09:41'),
(297, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:09:41'),
(298, 1, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:09:47'),
(299, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:09:47'),
(300, 1, 'DELETE_USER', 'admin', 'users', 5, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:22:14'),
(301, 1, 'DELETE /users/5', '5', '5', 5, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:22:14'),
(302, 1, 'UPDATE_USER', 'admin', 'users', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:22:54'),
(303, 1, 'PUT /users/9', '9', '9', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:22:54'),
(304, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 12:22:58'),
(305, 9, 'SEND_MESSAGE', 'communication', 'messages', 5, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:00:50'),
(306, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:00:50'),
(307, 9, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:02:35'),
(308, 1, 'PUT /5/read', 'read', 'read', 5, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:02:50'),
(309, 1, 'SEND_MESSAGE', 'communication', 'messages', 6, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:02:59'),
(310, 1, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:02:59'),
(311, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:03:23'),
(312, 9, 'PUT /6/read', 'read', 'read', 6, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:03:56'),
(313, 9, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:12:08'),
(314, 1, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:12:22'),
(315, 11, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 13:13:50'),
(316, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 13:16:56'),
(317, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 13:16:56'),
(318, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 13:17:00'),
(319, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 13:17:10'),
(320, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 13:17:22'),
(321, 9, 'UPDATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:00:22'),
(322, 9, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:00:22'),
(323, 9, 'POST /10/courses', 'courses', 'courses', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:01:05'),
(324, 9, 'UPDATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:01:20'),
(325, 9, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:01:20'),
(326, 9, 'DELETE /10/courses/20', 'courses', 'courses', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:03:48'),
(327, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:05:47'),
(328, 9, 'UPDATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:34:31'),
(329, 9, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:34:31'),
(330, 9, 'UPDATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:34:34'),
(331, 9, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:34:34'),
(332, 9, 'POST /10/courses', 'courses', 'courses', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:34:58'),
(333, 11, 'POST /logout', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', NULL, '2026-05-27 14:36:06'),
(334, 9, 'POST /api/media/upload', 'media', 'media', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:41:27'),
(335, 9, 'POST /api/media/upload', 'media', 'media', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:41:33'),
(336, 9, 'POST /api/media/upload', 'media', 'media', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:41:39'),
(337, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:44:18'),
(338, 9, 'CREATE_LESSON', 'cours', 'lessons', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:44:29'),
(339, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:44:29'),
(340, 9, 'CREATE_RESOURCE', 'cours', 'resources', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:44:56'),
(341, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 14:44:56'),
(342, 9, 'UPDATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:06:28'),
(343, 9, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:06:28'),
(344, 9, 'UPDATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:06:31'),
(345, 9, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:06:31'),
(346, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:06:56'),
(347, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:07:38'),
(348, 9, 'CREATE_LESSON', 'cours', 'lessons', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:07:42'),
(349, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:07:42'),
(350, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:08:40'),
(351, 9, 'CREATE_RESOURCE', 'cours', 'resources', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:08:43'),
(352, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:08:43'),
(353, 9, 'CREATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:09:42'),
(354, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:09:42'),
(355, 9, 'POST /10/courses', 'courses', 'courses', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:09:42'),
(356, 9, 'UPDATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:10:17'),
(357, 9, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:10:17'),
(358, 9, 'UPDATE_PATH', 'cours', 'paths', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:10:19'),
(359, 9, 'PUT /10', 'system', NULL, 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:10:19'),
(360, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:18:36'),
(361, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:18:36'),
(362, 9, 'POST /21/submit', 'submit', 'submit', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:18:36'),
(363, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:26:57'),
(364, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:26:57'),
(365, 9, 'POST /21/submit', 'submit', 'submit', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:26:57'),
(366, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:03'),
(367, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:03'),
(368, 9, 'POST /21/submit', 'submit', 'submit', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:03'),
(369, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:43'),
(370, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:43'),
(371, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:43'),
(372, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:45'),
(373, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:45'),
(374, 9, 'POST /21/submit', 'submit', 'submit', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:45'),
(375, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:47'),
(376, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:27:47'),
(377, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:36:57'),
(378, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:36:57'),
(379, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:36:57'),
(380, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:36:59'),
(381, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:36:59'),
(382, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:36:59'),
(383, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:37:12'),
(384, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:37:12'),
(385, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:43:06'),
(386, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:43:06'),
(387, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:43:06'),
(388, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:43:06'),
(389, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:46:38'),
(390, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:46:38'),
(391, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:46:38'),
(392, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:46:38'),
(393, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:47:34'),
(394, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:47:34'),
(395, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:47:34'),
(396, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:47:34'),
(397, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:47:52'),
(398, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:47:52'),
(399, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:48:14'),
(400, 9, 'CREATE_LESSON', 'cours', 'lessons', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:48:15'),
(401, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:48:15'),
(402, 9, 'UPDATE_COURSE', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:48:26'),
(403, 9, 'PUT /20', 'system', NULL, 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:48:26'),
(404, 9, 'AUTO_VALIDATE_COURSE_APPROVED', 'cours', 'courses', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:48:26'),
(405, 9, 'POST /20/submit', 'submit', 'submit', 20, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:48:26'),
(406, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:50:18'),
(407, 9, 'CREATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:15'),
(408, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:15'),
(409, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:15'),
(410, 9, 'POST /10/courses', 'courses', 'courses', 10, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:15'),
(411, 9, 'CREATE_SECTION', 'cours', 'sections', 4, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:30'),
(412, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:30'),
(413, 9, 'CREATE_LESSON', 'cours', 'lessons', 4, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:42'),
(414, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:42'),
(415, 9, 'CREATE_LESSON', 'cours', 'lessons', 6, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:48'),
(416, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:48'),
(417, 9, 'CREATE_LESSON', 'cours', 'lessons', 8, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:52'),
(418, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:51:52'),
(419, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:52:16'),
(420, 9, 'CREATE_RESOURCE', 'cours', 'resources', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:52:19'),
(421, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:52:19'),
(422, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:53:35'),
(423, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:53:35'),
(424, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:53:35'),
(425, 9, 'POST /21/submit', 'submit', 'submit', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:53:35'),
(426, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:53:55'),
(427, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:53:55'),
(428, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:53:55'),
(429, 9, 'POST /21/submit', 'submit', 'submit', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:53:55'),
(430, 9, 'UPDATE_COURSE', 'cours', 'courses', 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:04'),
(431, 9, 'PUT /21', 'system', NULL, 21, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:04'),
(432, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:20'),
(433, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:20'),
(434, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:20'),
(435, 9, 'POST /23/submit', 'submit', 'submit', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:20'),
(436, 9, 'POST /upload', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:44'),
(437, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:44'),
(438, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:44'),
(439, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:47'),
(440, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:47'),
(441, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:47'),
(442, 9, 'POST /23/submit', 'submit', 'submit', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:47'),
(443, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:52'),
(444, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:54:52'),
(445, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:58:31'),
(446, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:58:31'),
(447, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:58:31'),
(448, 9, 'POST /23/submit', 'submit', 'submit', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:58:31'),
(449, 9, 'CREATE_RESOURCE', 'cours', 'resources', 4, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:59:01'),
(450, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:59:01'),
(451, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:59:19'),
(452, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:59:19'),
(453, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:59:19'),
(454, 9, 'POST /23/submit', 'submit', 'submit', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 15:59:19'),
(455, 9, 'CREATE_RESOURCE', 'cours', 'resources', 5, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:01:07'),
(456, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:01:07'),
(457, 9, 'CREATE_RESOURCE', 'cours', 'resources', 6, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:01:18'),
(458, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:01:18'),
(459, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:01:26'),
(460, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:01:26'),
(461, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:01:26'),
(462, 9, 'POST /23/submit', 'submit', 'submit', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:01:26'),
(463, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:04:17'),
(464, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:04:17'),
(465, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:04:18'),
(466, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:04:18'),
(467, 9, 'AUTO_VALIDATE_COURSE_REJECTED', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:04:18'),
(468, 9, 'POST /23/submit', 'submit', 'submit', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:04:18'),
(469, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:06:38'),
(470, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:06:38'),
(471, 9, 'UPDATE_COURSE', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:06:40'),
(472, 9, 'PUT /23', 'system', NULL, 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:06:40'),
(473, 9, 'AUTO_VALIDATE_COURSE_APPROVED', 'cours', 'courses', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:06:40'),
(474, 9, 'POST /23/submit', 'submit', 'submit', 23, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:06:40'),
(475, 9, 'CREATE_LESSON', 'cours', 'lessons', 9, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:07:27'),
(476, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:07:27'),
(477, 9, 'CREATE_RESOURCE', 'cours', 'resources', 7, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:27:23'),
(478, 9, 'POST /', 'system', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'success', NULL, '2026-05-27 16:27:23');

-- --------------------------------------------------------

--
-- Structure de la table `badges`
--

CREATE TABLE `badges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icone` varchar(500) DEFAULT NULL,
  `critere` text DEFAULT NULL COMMENT 'Description du critère d attribution',
  `xp_valeur` int(10) UNSIGNED DEFAULT 0 COMMENT 'Points XP accordés avec ce badge',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `badges`
--

INSERT INTO `badges` (`id`, `nom`, `description`, `icone`, `critere`, `xp_valeur`, `created_at`) VALUES
(1, 'assidu', 'Ce badge recompense les assidus', NULL, '{\"type\":\"cours_inscrits\",\"valeur\":5}', 10, '2026-05-26 13:54:54');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `couleur` varchar(7) DEFAULT NULL COMMENT 'Code couleur HEX pour l UI',
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Hiérarchie de catégories (sous-catégorie)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `couleur`, `parent_id`, `created_at`, `updated_at`) VALUES
(1, 'Informatique & Programmation', 'informatique-programmation', 'Développement web, mobile et logiciel', 'code', '#3B82F6', NULL, '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(2, 'Mathématiques & Sciences', 'mathematiques-sciences', 'Algèbre, analyse, physique, chimie', 'calculator', '#10B981', NULL, '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(3, 'Langues & Communication', 'langues-communication', 'Français, Anglais, Wolof, Arabe…', 'language', '#F59E0B', NULL, '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(4, 'Management & Entrepreneuriat', 'management-entrepreneuriat', 'Gestion, création d entreprise en Afrique', 'briefcase', '#8B5CF6', NULL, '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(5, 'Santé & Bien-être', 'sante-bien-etre', 'Santé publique, nutrition, hygiène', 'heart', '#EF4444', NULL, '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(6, 'Agriculture & Environnement', 'agriculture-environnement', 'Agroécologie, gestion des ressources', 'leaf', '#84CC16', NULL, '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(7, 'Culture & Humanités', 'culture-humanites', 'Histoire africaine, philosophie, arts', 'book', '#F97316', NULL, '2026-05-17 17:07:30', '2026-05-17 17:07:30');

-- --------------------------------------------------------

--
-- Structure de la table `certificates`
--

CREATE TABLE `certificates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED DEFAULT NULL,
  `path_id` bigint(20) UNSIGNED DEFAULT NULL,
  `numero_serie` varchar(100) NOT NULL COMMENT 'Identifiant public vérifiable',
  `url_pdf` varchar(500) DEFAULT NULL COMMENT 'URL du certificat PDF (stockage local MinIO)',
  `emis_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `titre` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `objectifs` text DEFAULT NULL,
  `prerequis` text DEFAULT NULL,
  `instructor_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `niveau` enum('debutant','intermediaire','avance') DEFAULT 'debutant',
  `duree` int(11) DEFAULT NULL COMMENT 'Durée totale estimée en heures',
  `thumbnail` varchar(500) DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT 0.00 COMMENT 'Gratuit par défaut (souveraineté)',
  `langue` varchar(10) DEFAULT 'fr',
  `status` enum('draft','pending','published','archived') DEFAULT 'draft' COMMENT 'pending = soumis pour validation Admin',
  `note_moyenne` decimal(3,2) DEFAULT 0.00,
  `nb_inscrits` int(10) UNSIGNED DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Cours';

--
-- Déchargement des données de la table `courses`
--

INSERT INTO `courses` (`id`, `titre`, `slug`, `description`, `objectifs`, `prerequis`, `instructor_id`, `category_id`, `niveau`, `duree`, `thumbnail`, `prix`, `langue`, `status`, `note_moyenne`, `nb_inscrits`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Test course from script', 'test-course-from-script', 'Automated test', NULL, NULL, 1, NULL, NULL, NULL, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 17:35:41', '2026-05-17 17:35:41', NULL),
(6, 'Test course from script', 'test-course-from-script-xlvzy-9332', 'Automated test', NULL, NULL, 1, NULL, NULL, NULL, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 17:45:59', '2026-05-17 17:45:59', NULL),
(8, 'Updated title', 'test-course-from-script-uhn5l-0997', 'Automated test', NULL, NULL, 1, NULL, NULL, NULL, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 17:49:40', '2026-05-17 17:49:41', '2026-05-17 17:49:41'),
(10, 'Updated title', 'test-course-from-script-5y9cu-3039', 'Automated test', NULL, NULL, 1, NULL, NULL, NULL, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 17:52:43', '2026-05-17 17:52:43', '2026-05-17 17:52:43'),
(11, 'Updated Course Title', 'test-course-1779040474039', 'Updated description', 'Learn testing', NULL, 1, NULL, 'intermediaire', NULL, NULL, 0.00, 'fr', 'draft', 0.00, 0, '2026-05-17 17:54:34', '2026-05-17 17:54:34', NULL),
(12, 'Updated Course Title', 'test-course-1779040517375', 'Updated description', 'Learn testing', NULL, 1, NULL, 'intermediaire', NULL, NULL, 0.00, 'fr', 'draft', 0.00, 0, '2026-05-17 17:55:17', '2026-05-17 17:55:17', NULL),
(13, 'Updated Course Title', 'test-course-1779040553892', 'Updated description', 'Learn testing', NULL, 1, NULL, 'intermediaire', NULL, NULL, 0.00, 'fr', 'draft', 0.00, 0, '2026-05-17 17:55:53', '2026-05-17 17:55:53', NULL),
(14, 'Updated Course Title', 'test-course-1779040689511', 'Updated description', NULL, NULL, 1, NULL, 'intermediaire', 10, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 17:58:09', '2026-05-17 17:58:09', '2026-05-17 17:58:09'),
(15, 'Updated Course Title', 'test-course-1779041679618', 'Updated description', NULL, NULL, 1, NULL, 'intermediaire', 10, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 18:14:39', '2026-05-17 18:14:39', '2026-05-17 18:14:39'),
(16, 'Updated Course Title', 'test-course-1779041793606', 'Updated description', NULL, NULL, 1, NULL, 'intermediaire', 10, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 18:16:33', '2026-05-17 18:16:33', '2026-05-17 18:16:33'),
(17, 'Updated Course Title', 'test-course-1779041810752', 'Updated description', NULL, NULL, 1, NULL, 'intermediaire', 10, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 18:16:50', '2026-05-17 18:16:50', '2026-05-17 18:16:50'),
(18, 'Updated Course Title', 'test-course-1779042053094', 'Updated description', NULL, NULL, 1, NULL, 'intermediaire', 10, NULL, 0.00, NULL, 'draft', 0.00, 0, '2026-05-17 18:20:53', '2026-05-17 18:20:53', '2026-05-17 18:20:53'),
(20, 'JAVA POO', 'java', 'Mes premiers pas en java UTFATAFUTYVYVCYTFTVETYF7TYVFYGV', 'apprendre le java 0 a niveau avancé', 'une bonne base en programmation', 9, NULL, 'debutant', 60, 'http://localhost:3000/uploads/lessons/1779896217133_WhatsApp_Image_2026-05-04_at_22_10_07.jpeg', 0.00, 'fr', 'published', 0.00, 0, '2026-05-27 01:35:14', '2026-05-27 15:48:26', NULL),
(21, 'POLYMORPHISME JAVA', 'interface-java', 'TESTVEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEZEEEE', 'TESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', 'TEST', 9, NULL, 'debutant', 60, 'http://localhost:3000/uploads/lessons/1779895663659_8847419.png', 0.00, 'fr', 'draft', 0.00, 0, '2026-05-27 15:09:42', '2026-05-27 15:54:04', NULL),
(23, 'INTERFACE JAVA', 'interface-java-eya3k-5530', 'CYTCZG JVUYAVHJ H HVYVZ EJ IBZEZEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', 'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRR', 9, NULL, 'intermediaire', 60, 'http://localhost:3000/uploads/lessons/1779897284838_WhatsApp_Image_2026-05-04_at_22_10_07.jpeg', 0.00, 'fr', 'published', 0.00, 0, '2026-05-27 15:51:15', '2026-05-27 16:06:40', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `course_reviews`
--

CREATE TABLE `course_reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `note` tinyint(3) UNSIGNED NOT NULL COMMENT 'Note de 1 à 5',
  `commentaire` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `course_tag`
--

CREATE TABLE `course_tag` (
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `tag_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `course_validations`
--

CREATE TABLE `course_validations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `decision` enum('approved','rejected') NOT NULL,
  `commentaire` text DEFAULT NULL COMMENT 'Motif de refus ou remarque Admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Traçabilité des validations de cours par Admin (souveraineté)';

--
-- Déchargement des données de la table `course_validations`
--

INSERT INTO `course_validations` (`id`, `course_id`, `admin_id`, `decision`, `commentaire`, `created_at`) VALUES
(1, 20, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Titre suffisamment descriptif (≥ 5 caractères)\n• Description complète (≥ 50 caractères)\n• Au moins 3 leçons au total', '2026-05-27 15:43:06'),
(2, 20, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Titre suffisamment descriptif (≥ 5 caractères)\n• Description complète (≥ 50 caractères)\n• Au moins 3 leçons au total', '2026-05-27 15:46:38'),
(3, 20, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Au moins 3 leçons au total', '2026-05-27 15:47:34'),
(4, 20, NULL, 'approved', 'Validation automatique : tous les critères sont satisfaits.', '2026-05-27 15:48:26'),
(5, 23, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Image de couverture présente\n• Au moins 1 section créée\n• Au moins 3 leçons au total\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 15:51:15'),
(6, 21, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Description complète (≥ 50 caractères)\n• Objectifs pédagogiques définis (≥ 30 caractères)\n• Au moins 1 section créée\n• Au moins 3 leçons au total\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 15:53:35'),
(7, 21, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Au moins 1 section créée\n• Au moins 3 leçons au total\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 15:53:55'),
(8, 23, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Image de couverture présente\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 15:54:20'),
(9, 23, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 15:54:47'),
(10, 23, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 15:58:31'),
(11, 23, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 15:59:19'),
(12, 23, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 16:01:26'),
(13, 23, NULL, 'rejected', 'Validation automatique — refus. Critères non satisfaits :\n• Au moins 1 leçon avec contenu ou lien', '2026-05-27 16:04:18'),
(14, 23, NULL, 'approved', 'Validation automatique : tous les critères sont satisfaits.', '2026-05-27 16:06:40');

-- --------------------------------------------------------

--
-- Structure de la table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `progression` decimal(5,2) DEFAULT 0.00 COMMENT 'Pourcentage de complétion 0–100',
  `derniere_lecon` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Dernière leçon consultée (reprise)',
  `status` enum('active','completed','dropped') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Inscription — association Apprenant ↔ Cours';

--
-- Déchargement des données de la table `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `enrolled_at`, `completed_at`, `progression`, `derniere_lecon`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-05-17 18:14:39', NULL, 0.00, NULL, 'active', '2026-05-17 18:14:39', '2026-05-17 18:14:39');

-- --------------------------------------------------------

--
-- Structure de la table `forum_posts`
--

CREATE TABLE `forum_posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED DEFAULT NULL,
  `auteur_id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'NULL = question ; sinon = réponse',
  `titre` varchar(255) DEFAULT NULL COMMENT 'Uniquement pour les questions (parent_id NULL)',
  `corps` text NOT NULL,
  `epingle` tinyint(1) DEFAULT 0,
  `resolu` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `gdpr_requests`
--

CREATE TABLE `gdpr_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('access','delete','rectify','portability') NOT NULL,
  `statut` enum('pending','processing','completed','rejected') DEFAULT 'pending',
  `detail` text DEFAULT NULL,
  `traite_par` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Admin qui a traité la demande',
  `traite_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Conformité loi n°2008-12 sur les données personnelles (Sénégal)';

--
-- Déchargement des données de la table `gdpr_requests`
--

INSERT INTO `gdpr_requests` (`id`, `user_id`, `type`, `statut`, `detail`, `traite_par`, `traite_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'rectify', 'pending', NULL, NULL, NULL, '2026-05-24 22:22:14', '2026-05-24 22:22:14'),
(3, 1, 'access', 'pending', NULL, NULL, NULL, '2026-05-27 12:04:39', '2026-05-27 12:04:39'),
(4, 1, 'portability', 'pending', NULL, NULL, NULL, '2026-05-27 12:07:24', '2026-05-27 12:07:24'),
(5, 1, 'rectify', 'pending', NULL, NULL, NULL, '2026-05-27 12:07:33', '2026-05-27 12:07:33'),
(6, 1, 'access', 'pending', NULL, NULL, NULL, '2026-05-27 12:07:42', '2026-05-27 12:07:42'),
(7, 1, 'access', 'pending', NULL, NULL, NULL, '2026-05-27 12:08:43', '2026-05-27 12:08:43'),
(8, 1, 'delete', 'pending', NULL, NULL, NULL, '2026-05-27 12:09:41', '2026-05-27 12:09:41'),
(9, 1, 'delete', 'pending', NULL, NULL, NULL, '2026-05-27 12:09:47', '2026-05-27 12:09:47');

-- --------------------------------------------------------

--
-- Structure de la table `instructor_profiles`
--

CREATE TABLE `instructor_profiles` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `biographie` text DEFAULT NULL,
  `specialite` varchar(255) DEFAULT NULL,
  `site_web` varchar(500) DEFAULT NULL,
  `linkedin` varchar(500) DEFAULT NULL,
  `note_moyenne` decimal(3,2) DEFAULT 0.00 COMMENT 'Note moyenne calculée sur les évaluations',
  `nb_apprenants` int(10) UNSIGNED DEFAULT 0 COMMENT 'Nombre total d apprenants inscrits',
  `valide` tinyint(1) DEFAULT 0 COMMENT 'Formateur validé par l administrateur',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Profil étendu Formateur';

-- --------------------------------------------------------

--
-- Structure de la table `learner_profiles`
--

CREATE TABLE `learner_profiles` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `niveau_scolaire` varchar(100) DEFAULT NULL,
  `objectif` text DEFAULT NULL COMMENT 'Objectif d apprentissage déclaré',
  `total_heures` decimal(8,2) DEFAULT 0.00 COMMENT 'Cumul temps de travail en heures',
  `total_cours` int(10) UNSIGNED DEFAULT 0 COMMENT 'Cours complétés à vie',
  `xp_points` int(10) UNSIGNED DEFAULT 0 COMMENT 'Points d expérience gamification',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Profil étendu Apprenant';

--
-- Déchargement des données de la table `learner_profiles`
--

INSERT INTO `learner_profiles` (`user_id`, `niveau_scolaire`, `objectif`, `total_heures`, `total_cours`, `xp_points`, `created_at`, `updated_at`) VALUES
(2, NULL, NULL, 0.00, 0, 0, '2026-05-17 17:54:32', '2026-05-17 17:54:32'),
(3, NULL, NULL, 0.00, 0, 0, '2026-05-17 17:55:16', '2026-05-17 17:55:16'),
(4, NULL, NULL, 0.00, 0, 0, '2026-05-17 17:55:52', '2026-05-17 17:55:52'),
(5, NULL, NULL, 0.00, 0, 0, '2026-05-17 17:58:08', '2026-05-17 17:58:08'),
(6, NULL, NULL, 0.00, 0, 0, '2026-05-17 18:14:38', '2026-05-17 18:14:38'),
(7, NULL, NULL, 0.00, 0, 0, '2026-05-17 18:16:32', '2026-05-17 18:16:32'),
(8, NULL, NULL, 0.00, 0, 0, '2026-05-17 18:16:49', '2026-05-17 18:16:49'),
(9, NULL, NULL, 0.00, 0, 0, '2026-05-17 18:20:52', '2026-05-17 18:20:52'),
(11, NULL, NULL, 0.00, 0, 0, '2026-05-26 13:34:43', '2026-05-26 13:34:43');

-- --------------------------------------------------------

--
-- Structure de la table `lessons`
--

CREATE TABLE `lessons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Dénormalisé pour requêtes rapides',
  `titre` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `contenu` longtext DEFAULT NULL COMMENT 'Contenu texte HTML/Markdown',
  `url` varchar(1000) DEFAULT NULL,
  `thumbnail` varchar(1000) DEFAULT NULL,
  `duree` int(11) DEFAULT NULL COMMENT 'Durée estimée en minutes',
  `ordre` int(11) DEFAULT 0,
  `is_free` tinyint(1) DEFAULT 0 COMMENT 'Leçon prévisualisable sans inscription',
  `status` enum('draft','published') DEFAULT 'draft',
  `type` enum('video','pdf','texte','lien','projet') DEFAULT 'texte',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Leçon — unité atomique de contenu';

--
-- Déchargement des données de la table `lessons`
--

INSERT INTO `lessons` (`id`, `section_id`, `course_id`, `titre`, `slug`, `description`, `contenu`, `url`, `thumbnail`, `duree`, `ordre`, `is_free`, `status`, `type`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 3, 20, 'INTRO', 'intro', '', 'TEST', 'http://localhost:3000/uploads/lessons/1779893058041_printable-postgresql-sample-database-dia.pdf', NULL, 10, 1, 1, 'draft', 'projet', '2026-05-27 14:44:29', '2026-05-27 14:44:29', NULL),
(2, 3, 20, 'INTRO PROG OBJECT', 'intro-prog-object', '', '', '', 'http://localhost:3000/uploads/lessons/1779894458204_8847419.png', 60, 2, 1, 'draft', 'texte', '2026-05-27 15:07:42', '2026-05-27 15:07:42', NULL),
(3, 3, 20, 'HERITAGE', 'heritage', '', '', '', 'http://localhost:3000/uploads/lessons/1779896894353_WhatsApp_Image_2026-05-19_at_12_53_52.jpeg', 10, 3, 1, 'draft', 'texte', '2026-05-27 15:48:15', '2026-05-27 15:48:15', NULL),
(4, 4, 23, 'TEST', 'test', '', '', '', '', 10, 1, 1, 'draft', 'texte', '2026-05-27 15:51:42', '2026-05-27 15:51:42', NULL),
(6, 4, 23, 'TEST', 'test-7bhdm-8980', '', '', '', '', 10, 2, 1, 'draft', 'texte', '2026-05-27 15:51:48', '2026-05-27 15:51:48', NULL),
(8, 4, 23, 'TEST', 'test-prmhx-2826', '', '', '', '', 10, 3, 1, 'draft', 'texte', '2026-05-27 15:51:52', '2026-05-27 15:51:52', NULL),
(9, 4, 23, 'ttttttewst', 'ttttttewst', '', '', '', '', 10, 4, 1, 'draft', 'texte', '2026-05-27 16:07:27', '2026-05-27 16:07:27', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `enrollment_id` bigint(20) UNSIGNED NOT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `temps_passe` int(10) UNSIGNED DEFAULT 0 COMMENT 'Secondes passées sur la leçon',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Session — suivi granulaire par leçon';

-- --------------------------------------------------------

--
-- Structure de la table `media_files`
--

CREATE TABLE `media_files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uploader_id` bigint(20) UNSIGNED NOT NULL,
  `nom_original` varchar(500) NOT NULL,
  `nom_stockage` varchar(500) NOT NULL COMMENT 'Nom unique côté MinIO',
  `mime_type` varchar(100) NOT NULL,
  `taille_ko` int(10) UNSIGNED NOT NULL,
  `bucket` varchar(100) DEFAULT 'edaara' COMMENT 'Bucket MinIO',
  `url_locale` varchar(1000) NOT NULL COMMENT 'URL interne MinIO — pas de cloud US',
  `context_type` varchar(100) DEFAULT NULL COMMENT 'Table qui référence ce fichier',
  `context_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stockage fichiers local MinIO — souveraineté numérique';

--
-- Déchargement des données de la table `media_files`
--

INSERT INTO `media_files` (`id`, `uploader_id`, `nom_original`, `nom_stockage`, `mime_type`, `taille_ko`, `bucket`, `url_locale`, `context_type`, `context_id`, `created_at`) VALUES
(1, 9, 'printable-postgresql-sample-database-diagram.pdf', '1779893058041_printable-postgresql-sample-database-dia.pdf', 'application/pdf', 467, 'local', 'http://localhost:3000/uploads/lessons/1779893058041_printable-postgresql-sample-database-dia.pdf', 'lesson', NULL, '2026-05-27 14:44:18'),
(2, 9, '8847419.png', '1779894458204_8847419.png', 'image/png', 22, 'local', 'http://localhost:3000/uploads/lessons/1779894458204_8847419.png', 'lesson', NULL, '2026-05-27 15:07:38'),
(3, 9, 'Projet_Admin_WinServer.pdf', '1779894520249_Projet_Admin_WinServer.pdf', 'application/pdf', 16, 'local', 'http://localhost:3000/uploads/lessons/1779894520249_Projet_Admin_WinServer.pdf', 'lesson', 2, '2026-05-27 15:08:40'),
(4, 9, '8847419.png', '1779895663659_8847419.png', 'image/png', 22, 'local', 'http://localhost:3000/uploads/lessons/1779895663659_8847419.png', 'cours', NULL, '2026-05-27 15:27:43'),
(5, 9, 'WhatsApp Image 2026-05-04 at 22.10.07.jpeg', '1779896217133_WhatsApp_Image_2026-05-04_at_22_10_07.jpeg', 'image/jpeg', 85, 'local', 'http://localhost:3000/uploads/lessons/1779896217133_WhatsApp_Image_2026-05-04_at_22_10_07.jpeg', 'cours', NULL, '2026-05-27 15:36:57'),
(6, 9, 'WhatsApp Image 2026-05-19 at 12.53.52.jpeg', '1779896894353_WhatsApp_Image_2026-05-19_at_12_53_52.jpeg', 'image/jpeg', 69, 'local', 'http://localhost:3000/uploads/lessons/1779896894353_WhatsApp_Image_2026-05-19_at_12_53_52.jpeg', 'lesson', NULL, '2026-05-27 15:48:14'),
(7, 9, 'Capture dâÃ©cran (309).png', '1779897018225_Capture_d_____cran__309_.png', 'image/png', 602, 'local', 'http://localhost:3000/uploads/lessons/1779897018225_Capture_d_____cran__309_.png', 'cours', NULL, '2026-05-27 15:50:18'),
(8, 9, 'Enregistrement 2026-05-26 150344.mp4', '1779897133491_Enregistrement_2026-05-26_150344.mp4', 'video/mp4', 151265, 'local', 'http://localhost:3000/uploads/lessons/1779897133491_Enregistrement_2026-05-26_150344.mp4', 'lesson', 4, '2026-05-27 15:52:16'),
(9, 9, 'WhatsApp Image 2026-05-04 at 22.10.07.jpeg', '1779897284838_WhatsApp_Image_2026-05-04_at_22_10_07.jpeg', 'image/jpeg', 85, 'local', 'http://localhost:3000/uploads/lessons/1779897284838_WhatsApp_Image_2026-05-04_at_22_10_07.jpeg', 'cours', NULL, '2026-05-27 15:54:44');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `expediteur_id` bigint(20) UNSIGNED NOT NULL,
  `destinataire_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Contexte : cours concerné',
  `sujet` varchar(255) DEFAULT NULL,
  `corps` text NOT NULL,
  `lu_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `expediteur_id`, `destinataire_id`, `course_id`, `sujet`, `corps`, `lu_at`, `created_at`) VALUES
(3, 1, 11, NULL, NULL, 'Bonjour', '2026-05-27 01:09:35', '2026-05-27 01:08:08'),
(4, 11, 1, NULL, NULL, 'Salut comment vous allez', '2026-05-27 01:09:46', '2026-05-27 01:09:05'),
(5, 9, 1, NULL, 'TEST', 'CUCU', '2026-05-27 13:02:50', '2026-05-27 13:00:50'),
(6, 1, 9, NULL, 'Re: TEST', 'yupppp', '2026-05-27 13:03:56', '2026-05-27 13:02:59');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(100) NOT NULL COMMENT 'course_published | quiz_graded | certificate_issued …',
  `titre` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Payload JSON (liens, IDs référencés)' CHECK (json_valid(`data`)),
  `lu_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Notification';

-- --------------------------------------------------------

--
-- Structure de la table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paths`
--

CREATE TABLE `paths` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `titre` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `objectifs` text DEFAULT NULL COMMENT 'Ce que l apprenant saura faire en fin de parcours',
  `prerequis` text DEFAULT NULL,
  `niveau` enum('debutant','intermediaire','avance') DEFAULT 'debutant',
  `duree_estimee` int(11) DEFAULT NULL COMMENT 'Durée estimée en heures',
  `thumbnail` varchar(500) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `instructor_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Parcours — agrégat de cours';

--
-- Déchargement des données de la table `paths`
--

INSERT INTO `paths` (`id`, `titre`, `slug`, `description`, `objectifs`, `prerequis`, `niveau`, `duree_estimee`, `thumbnail`, `category_id`, `instructor_id`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Test Path', 'test-path', 'Test', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', '2026-05-17 18:14:39', '2026-05-17 18:14:39', NULL),
(3, 'Test Path', 'test-path-kr0g5-3711', 'Test', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', '2026-05-17 18:16:33', '2026-05-17 18:16:33', NULL),
(5, 'Test Path', 'test-path-l7jd1-0857', 'Test', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', '2026-05-17 18:16:50', '2026-05-17 18:16:50', NULL),
(7, 'Test Path', 'test-path-bnyx2-3200', 'Test', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', '2026-05-17 18:20:53', '2026-05-17 18:20:53', NULL),
(9, 'hehgd', 'hehgd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 11, 'draft', '2026-05-26 13:37:18', '2026-05-26 13:37:18', NULL),
(10, 'Developpeur Java', 'java', 'TEST', 'TESTTT', 'TESTTT', 'debutant', 10, NULL, NULL, 9, 'published', '2026-05-27 01:40:54', '2026-05-27 15:06:31', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `path_course`
--

CREATE TABLE `path_course` (
  `path_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `ordre` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `path_course`
--

INSERT INTO `path_course` (`path_id`, `course_id`, `ordre`) VALUES
(10, 20, 1),
(10, 21, 2),
(10, 23, 3);

-- --------------------------------------------------------

--
-- Structure de la table `path_enrollments`
--

CREATE TABLE `path_enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `path_id` bigint(20) UNSIGNED NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `progression` decimal(5,2) DEFAULT 0.00,
  `status` enum('active','completed','dropped') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inscription à un Parcours';

-- --------------------------------------------------------

--
-- Structure de la table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `module` varchar(100) DEFAULT NULL COMMENT 'Module applicatif : auth | cours | quiz | admin …',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `module`, `description`, `created_at`, `updated_at`) VALUES
(1, 'view_dashboard', 'admin', 'Voir le tableau de bord admin', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(2, 'manage_users', 'admin', 'Gérer les utilisateurs (CRUD)', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(3, 'manage_roles', 'admin', 'Gérer les rôles et permissions', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(4, 'view_audit_logs', 'admin', 'Consulter les logs d audit', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(5, 'manage_settings', 'admin', 'Modifier les paramètres plateforme', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(6, 'validate_course', 'admin', 'Valider ou refuser un cours', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(7, 'view_reports', 'admin', 'Voir les statistiques globales', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(8, 'create_course', 'cours', 'Créer un cours', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(9, 'edit_own_course', 'cours', 'Modifier ses propres cours', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(10, 'delete_own_course', 'cours', 'Supprimer ses propres cours', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(11, 'publish_course', 'cours', 'Soumettre un cours à validation', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(12, 'create_path', 'cours', 'Créer un parcours', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(13, 'manage_assessments', 'quiz', 'Créer et gérer les quiz', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(14, 'view_student_results', 'quiz', 'Voir les résultats des apprenants', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(15, 'enroll_course', 'student', 'S inscrire à un cours', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(16, 'submit_assessment', 'student', 'Soumettre un quiz', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(17, 'view_own_progress', 'student', 'Voir sa propre progression', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(18, 'request_gdpr', 'gdpr', 'Faire une demande RGPD / CDP', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(19, 'auth:login', 'auth', 'Se connecter', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(20, 'auth:register', 'auth', 'S\'inscrire', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(21, 'auth:logout', 'auth', 'Se déconnecter', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(22, 'auth:refresh-token', 'auth', 'Renouveler le token', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(23, 'users:read', 'users', 'Consulter son profil', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(24, 'users:update', 'users', 'Modifier son profil', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(25, 'users:change-password', 'users', 'Changer le mot de passe', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(26, 'users:list', 'users', 'Lister les utilisateurs (admin)', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(27, 'users:manage-status', 'users', 'Gérer le statut des utilisateurs (admin)', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(28, 'courses:list', 'courses', 'Lister les cours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(29, 'courses:read', 'courses', 'Lire les détails d\'un cours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(30, 'courses:create', 'courses', 'Créer un nouveau cours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(31, 'courses:update', 'courses', 'Modifier un cours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(32, 'courses:delete', 'courses', 'Supprimer un cours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(33, 'courses:publish', 'courses', 'Publier/dépublier un cours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(34, 'courses:validate', 'courses', 'Valider les cours (admin)', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(35, 'paths:list', 'paths', 'Lister les parcours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(36, 'paths:read', 'paths', 'Lire les détails d\'un parcours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(37, 'paths:create', 'paths', 'Créer un parcours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(38, 'paths:update', 'paths', 'Modifier un parcours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(39, 'paths:delete', 'paths', 'Supprimer un parcours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(40, 'lessons:list', 'lessons', 'Lister les leçons', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(41, 'lessons:read', 'lessons', 'Accéder à une leçon', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(42, 'lessons:create', 'lessons', 'Créer une leçon', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(43, 'lessons:update', 'lessons', 'Modifier une leçon', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(44, 'lessons:delete', 'lessons', 'Supprimer une leçon', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(45, 'resources:upload', 'lessons', 'Uploader des ressources (vidéo, PDF)', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(46, 'assessments:list', 'assessments', 'Lister les évaluations', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(47, 'assessments:read', 'assessments', 'Accéder à une évaluation', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(48, 'assessments:create', 'assessments', 'Créer une évaluation', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(49, 'assessments:update', 'assessments', 'Modifier une évaluation', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(50, 'assessments:submit', 'assessments', 'Soumettre des réponses à un quiz', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(51, 'assessments:grade', 'assessments', 'Corriger les devoirs', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(52, 'enrollments:list', 'enrollments', 'Lister ses inscriptions', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(53, 'enrollments:create', 'enrollments', 'S\'inscrire à un cours', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(54, 'enrollments:progress', 'enrollments', 'Consulter sa progression', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(55, 'enrollments:manage', 'enrollments', 'Gérer les inscriptions (admin)', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(56, 'admin:dashboard', 'admin', 'Accéder au tableau de bord admin', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(57, 'admin:statistics', 'admin', 'Consulter les statistiques', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(58, 'admin:audit-logs', 'admin', 'Consulter les logs d\'audit', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(59, 'admin:settings', 'admin', 'Gérer les paramètres', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(60, 'admin:categories', 'admin', 'Gérer les catégories', '2026-05-17 17:07:53', '2026-05-17 17:07:53'),
(61, 'admin:permissions', 'admin', 'Gérer les permissions', '2026-05-17 17:07:53', '2026-05-17 17:07:53');

-- --------------------------------------------------------

--
-- Structure de la table `questions`
--

CREATE TABLE `questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `assessment_id` bigint(20) UNSIGNED NOT NULL,
  `enonce` longtext NOT NULL,
  `type` enum('qcm','vrai_faux','reponse_courte','essai') DEFAULT 'qcm',
  `points` int(11) DEFAULT 1,
  `explication` longtext DEFAULT NULL COMMENT 'Explication affichée après la correction',
  `ordre` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Question';

-- --------------------------------------------------------

--
-- Structure de la table `question_answers`
--

CREATE TABLE `question_answers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `texte` longtext NOT NULL,
  `est_correcte` tinyint(1) DEFAULT 0,
  `ordre` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Reponse';

-- --------------------------------------------------------

--
-- Structure de la table `quiz_results`
--

CREATE TABLE `quiz_results` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `assessment_id` bigint(20) UNSIGNED NOT NULL,
  `submission_id` bigint(20) UNSIGNED NOT NULL,
  `score` decimal(6,2) NOT NULL,
  `score_max` int(11) NOT NULL,
  `est_reussi` tinyint(1) DEFAULT 0,
  `tentative_num` tinyint(3) UNSIGNED DEFAULT 1,
  `duree_sec` int(10) UNSIGNED DEFAULT NULL COMMENT 'Durée réelle de passage en secondes',
  `soumis_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe ResultatQuiz — suivi des tentatives';

-- --------------------------------------------------------

--
-- Structure de la table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` varchar(255) NOT NULL COMMENT 'Hash SHA-256 du refresh token',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `revoked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rotation des refresh tokens JWT — sécurité OWASP';

--
-- Déchargement des données de la table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `ip_address`, `user_agent`, `expires_at`, `revoked`, `created_at`) VALUES
(1, 1, '7a42e8850fbf0f523bb22bba81621e694744b09d68f028a7b2b97a4e8dd7c85a', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:29:41', 0, '2026-05-17 17:29:41'),
(2, 1, '7daa0a07be47d8add429ca00e7ceecc953d5b0d6077f30969cf5990d35cf9513', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:35:41', 0, '2026-05-17 17:35:41'),
(3, 1, '15d0ff051525cf064b9ce5ef3cda901b6c70a1dcc36a1bc5f173f7de5a60f622', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:36:31', 0, '2026-05-17 17:36:31'),
(4, 1, '40f238931d311e296e67b2c29084fbb76733b54f150cd5c1eb48ed01973f106f', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:42:38', 0, '2026-05-17 17:42:38'),
(5, 1, 'd2c0dd6913a6b28f779dca4917deef5f4819e487727bacef920829d37e9c2080', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:42:59', 0, '2026-05-17 17:42:59'),
(6, 1, '4c34b8155fb7849387acd0ddd52b88f1dd6b691e83d4b2468d1a6069c7f547f1', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:45:59', 0, '2026-05-17 17:45:59'),
(7, 1, '651e820d80a5b00bfb95cb32ee30698b7c97ad349596c4d58ef5bd4e18a17946', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:49:40', 0, '2026-05-17 17:49:40'),
(8, 1, '277b235e4aeeb2917b1303ee4e9771c3af8299dcc3a874f581ae15e199b5cd72', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:52:43', 0, '2026-05-17 17:52:43'),
(9, 2, 'a5fc555f9e2eb6eea41e702bdacb991e3676a6524276b40fe347b1de8e719d87', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:54:33', 0, '2026-05-17 17:54:33'),
(10, 1, '7a7e1f4b6c08a74d0738469a8ad1e0db69171fea6d7fc20365f01e249189aaa6', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:54:33', 0, '2026-05-17 17:54:33'),
(11, 3, '438d706677b1a8eb02eec834ca1e35bc2d3e69380ed99c2cab8601bf52ffee88', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:55:16', 0, '2026-05-17 17:55:16'),
(12, 1, 'cb586e5f54d960e1785540bc58b142ec8d4d53d67643a823771417ba3f0f2dfd', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:55:16', 0, '2026-05-17 17:55:16'),
(13, 4, '3bd4e1e8bb7ddbc54ee57c89ca9c583e4168b0b6f42ead9998383aac7d793406', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:55:52', 0, '2026-05-17 17:55:52'),
(14, 1, '9fd775c480cd659b1fc087cec6dcf55d78d74c3834549a55587498aa89b444e3', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:55:53', 0, '2026-05-17 17:55:53'),
(15, 5, '33a7db52381c04efb887d3baef7d1868d2114709d2afbf60d86645e097a25a38', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:58:08', 0, '2026-05-17 17:58:08'),
(16, 1, 'de885f447a58d2c95970399efe5dbcf259ee5d78556ca641c864f42edbeb6beb', '127.0.0.1', 'axios/1.16.1', '2026-06-16 17:58:08', 0, '2026-05-17 17:58:08'),
(17, 6, 'd79922a58840bbbc9664630001be357e25f0d7a51b12049e7a9ef2a978a0ae35', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:14:38', 0, '2026-05-17 18:14:38'),
(18, 1, '07a557d109cc764f12812cc4d246525bccbee04fec528ebdcdb74a7d59bbb5db', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:14:38', 0, '2026-05-17 18:14:38'),
(19, 7, 'd6ff287130fa41d3de2d83f8175322e8321aef21d0b69f3ea6cb14cc2da4e7dc', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:16:32', 0, '2026-05-17 18:16:32'),
(20, 1, 'c3a1e2cc34429aa5383d86f0122e37d0e5b605f26a6397fbbefde244c17ed5c8', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:16:32', 0, '2026-05-17 18:16:32'),
(21, 8, '806330be4d88801ae2d6fadfffd46390be7619ec2be1f0568b8ada6faa36a04e', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:16:49', 0, '2026-05-17 18:16:49'),
(22, 1, '20294dc3502e514fd213f9cd0f63b2de68b7a2151d4a223acced5ebefabc0bfb', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:16:50', 0, '2026-05-17 18:16:50'),
(23, 9, '929bc439b1d0fd6eac5d9650175804db1c3fd6f6d4ac54f6f025d165bd86e176', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:20:52', 0, '2026-05-17 18:20:52'),
(24, 1, '78616507d8367dce0b9efc3f58d6cabff863863aec5245bb0940cd7ae76d9dba', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:20:52', 0, '2026-05-17 18:20:52'),
(25, 1, 'd303e407eec18c9175106b6e3a85816684e212c4e5146255f9b36faa0adf5871', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:24:42', 0, '2026-05-17 18:24:42'),
(26, 1, 'f8cebe3320b2a5ccac2771b702a726239a7739e6f2798df9f1c26d7949f89181', '127.0.0.1', 'axios/1.16.1', '2026-06-16 18:26:55', 0, '2026-05-17 18:26:55'),
(27, 1, '8bfe1d2b95fe369eb576734af7adac53b5a565bdbac0cf7f1aa97c6046f0d845', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-24 22:30:41', 1, '2026-05-24 21:36:18'),
(30, 1, '70ed02c958fa67abca86ac787856cf32f82b09870923aba83323ded79545a006', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-24 22:42:36', 1, '2026-05-24 22:42:03'),
(32, 1, 'de263bad672a790196abc6ef5d2b942cabf775f31e903e003ee400b23e9aeea0', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-24 22:59:14', 1, '2026-05-24 22:59:04'),
(34, 1, '997089b984602c60f480c6af89ac6ba5db9cc14752c267e43aff926ef5f14ea5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-24 23:01:48', 1, '2026-05-24 23:00:46'),
(35, 1, 'e4932e75a7f3a27a164ac9950a796e015ce61efc69d7cbdc28db64103bed4096', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-24 23:03:06', 1, '2026-05-24 23:01:51'),
(37, 1, '62bb7828fe25dc8023acd6193611133e8c15b080501a614e6e5b04a684511e12', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-24 23:16:28', 1, '2026-05-24 23:16:05'),
(39, 1, 'c0637fa39147412336c9dccb75c6906eb9d9ad51cfa0321543c2aaab71b04f63', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-24 23:18:15', 1, '2026-05-24 23:16:50'),
(41, 1, 'e4857b9124034227fb09ddcaf05c96889137e17f2c3ab2f2e1320f7473a703da', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-24 23:19:32', 1, '2026-05-24 23:19:26'),
(44, 1, '908509eca63f55da63ad1f797b2235569a5827e2b13e3da9f8b5466b217440d6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-06-24 14:44:34', 0, '2026-05-25 14:44:34'),
(45, 1, '63a903fab35c5c22b3a199b9d599f0c275e4702d411d0a0d6557fd2b19d016bb', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-06-25 13:22:51', 0, '2026-05-26 13:22:51'),
(46, 11, '322480f956dc700538772782c93bab3313d6965a3f4b672af897eaf7b13c9477', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 14:33:56', 1, '2026-05-26 13:36:52'),
(47, 11, 'f9f18c6dcb59711319fcf34bbb45a255a8b9bd8b91e14a226fbeb777c04d20a5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-25 14:33:59', 0, '2026-05-26 14:33:59'),
(48, 1, '6f5fe46065ab2f529d10f5c86f3984b490933ce75b02581ae5747747d85dada5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-27 12:22:58', 1, '2026-05-27 00:36:42'),
(49, 11, 'fb3145349eecfd19ab0eb677cc6ff64035bb8767fd1bb6486596640bfcf66a6e', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-26 01:08:29', 0, '2026-05-27 01:08:29'),
(50, 11, 'f3c193b5f5badf9349dce431dde72ab6b297450ccbf6c1a7c81bf7a9faac4711', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-26 01:14:43', 0, '2026-05-27 01:14:43'),
(51, 11, 'a7db8dd3d7c198a1e5be78d27db4a63873fb2ff910b6a78b174951960b58c021', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-26 01:19:32', 0, '2026-05-27 01:19:32'),
(52, 11, '6098b6e7cab684e11a3a5a3738f1fede02a7a933d579da78cddabfda4771d929', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-27 01:22:36', 1, '2026-05-27 01:22:36'),
(53, 11, '799f25265c7f0a0ecf63453ffbabe2a613ced1e6938e6f38d32a4d9f807c23fc', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-26 01:24:33', 0, '2026-05-27 01:24:33'),
(54, 9, '0cdc5b8c3727629e126655601c8f52197aa211a84e8b824aabb9a28482be10ca', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-26 01:31:38', 0, '2026-05-27 01:31:38'),
(55, 9, 'a987e2fae2aad30e70be21a629b6b854e165d2c687fa1c5660a2202240ea790a', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-27 13:02:35', 1, '2026-05-27 12:23:06'),
(56, 1, '6f6686302dbdd2e95aa78f1509f2a99215e0ad578f0197451a27a9bb827ee0cf', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-27 13:03:23', 1, '2026-05-27 13:02:37'),
(57, 9, 'f73bac198cdd35a1bb392ab48f660d29fd1e6b3132a7008f8501777f1d51c836', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-27 13:12:08', 1, '2026-05-27 13:03:41'),
(58, 1, 'b7346685aabbdcb48301bbd577beef8ae4c0915d56783b55a81099d3890b9cec', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-27 13:12:22', 1, '2026-05-27 13:12:10'),
(59, 11, '385b0b6ed66b5b070d289aa63901d7d24969d785f97d977e6dabee0000a50dbd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-27 13:13:50', 1, '2026-05-27 13:12:31'),
(60, 11, '8cd2b17d5f7027b24bb065b24bf317ce60fafb60fff67996737079f1792757b6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-27 14:36:06', 1, '2026-05-27 13:14:14'),
(61, 1, '328e9ad209daee72543b16e024c6d65937cc9dea67091252ca23009905dcf2a5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-06-26 14:36:12', 0, '2026-05-27 14:36:12');

-- --------------------------------------------------------

--
-- Structure de la table `resources`
--

CREATE TABLE `resources` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('video','pdf','lien','mini_projet','audio','image','texte','projet') NOT NULL,
  `titre` varchar(255) NOT NULL,
  `url` varchar(1000) NOT NULL COMMENT 'URL locale (MinIO) ou externe',
  `contenu` longtext DEFAULT NULL,
  `taille_ko` int(10) UNSIGNED DEFAULT NULL COMMENT 'Taille fichier en ko (pour les fichiers locaux)',
  `duree_sec` int(10) UNSIGNED DEFAULT NULL COMMENT 'Durée en secondes (pour vidéo/audio)',
  `ordre` int(11) DEFAULT 0,
  `is_telechar` tinyint(1) DEFAULT 0 COMMENT 'Téléchargeable hors ligne',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Ressource — composition de Leçon';

--
-- Déchargement des données de la table `resources`
--

INSERT INTO `resources` (`id`, `lesson_id`, `type`, `titre`, `url`, `contenu`, `taille_ko`, `duree_sec`, `ordre`, `is_telechar`, `created_at`, `updated_at`) VALUES
(1, 1, 'lien', 'TEST', 'TEST', NULL, NULL, NULL, 1, 0, '2026-05-27 14:44:56', '2026-05-27 14:44:56'),
(2, 2, 'pdf', 'SUPPORT', 'http://localhost:3000/uploads/lessons/1779894520249_Projet_Admin_WinServer.pdf', NULL, NULL, NULL, 1, 0, '2026-05-27 15:08:43', '2026-05-27 15:08:43'),
(3, 4, 'video', 'TEST', 'http://localhost:3000/uploads/lessons/1779897133491_Enregistrement_2026-05-26_150344.mp4', NULL, NULL, NULL, 1, 0, '2026-05-27 15:52:19', '2026-05-27 15:52:19'),
(4, 4, 'lien', 'TESDT', 'EEE', NULL, NULL, NULL, 2, 0, '2026-05-27 15:59:01', '2026-05-27 15:59:01'),
(5, 6, 'lien', 'ddddd', 'ddddddddd', NULL, NULL, NULL, 1, 0, '2026-05-27 16:01:07', '2026-05-27 16:01:07'),
(6, 8, 'lien', 'fffff', 'ffff', NULL, NULL, NULL, 1, 0, '2026-05-27 16:01:18', '2026-05-27 16:01:18'),
(7, 9, 'texte', 'vf', '', '<a href=\"fffff\">ff</a>', NULL, NULL, 1, 0, '2026-05-27 16:27:23', '2026-05-27 16:27:23');

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'admin | instructor | student | visitor',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Administrateur — accès complet à la plateforme', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(2, 'instructor', 'Formateur — crée et gère ses cours', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(3, 'student', 'Apprenant — suit les cours et passe les quiz', '2026-05-17 17:07:30', '2026-05-17 17:07:30'),
(4, 'visitor', 'Visiteur non authentifié — accès catalogue seulement', '2026-05-17 17:07:30', '2026-05-17 17:07:30');

-- --------------------------------------------------------

--
-- Structure de la table `role_permission`
--

CREATE TABLE `role_permission` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `role_permission`
--

INSERT INTO `role_permission` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 33),
(1, 34),
(1, 35),
(1, 36),
(1, 37),
(1, 38),
(1, 39),
(1, 40),
(1, 41),
(1, 42),
(1, 43),
(1, 44),
(1, 45),
(1, 46),
(1, 47),
(1, 48),
(1, 49),
(1, 50),
(1, 51),
(1, 52),
(1, 53),
(1, 54),
(1, 55),
(1, 56),
(1, 57),
(1, 58),
(1, 59),
(1, 60),
(1, 61),
(2, 19),
(2, 21),
(2, 22),
(2, 23),
(2, 24),
(2, 25),
(2, 28),
(2, 29),
(2, 30),
(2, 31),
(2, 32),
(2, 33),
(2, 35),
(2, 36),
(2, 37),
(2, 38),
(2, 39),
(2, 42),
(2, 43),
(2, 44),
(2, 45),
(2, 48),
(2, 49),
(2, 51),
(2, 52),
(3, 19),
(3, 21),
(3, 22),
(3, 23),
(3, 24),
(3, 25),
(3, 28),
(3, 29),
(3, 35),
(3, 36),
(3, 41),
(3, 46),
(3, 47),
(3, 50),
(3, 52),
(3, 53),
(3, 54),
(4, 19),
(4, 20),
(4, 28),
(4, 29),
(4, 35),
(4, 36),
(4, 41);

-- --------------------------------------------------------

--
-- Structure de la table `sections`
--

CREATE TABLE `sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ordre` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sections / chapitres d un cours';

--
-- Déchargement des données de la table `sections`
--

INSERT INTO `sections` (`id`, `course_id`, `titre`, `description`, `ordre`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 20, 'LES CLASSSES EN JAVA', NULL, 1, '2026-05-27 01:41:43', '2026-05-27 01:41:43', NULL),
(4, 23, 'TEST SECT ', NULL, 1, '2026-05-27 15:51:30', '2026-05-27 15:51:30', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cle` varchar(255) NOT NULL,
  `valeur` text DEFAULT NULL,
  `groupe` varchar(100) DEFAULT 'general',
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Paramètres configurables de la plateforme (admin)';

--
-- Déchargement des données de la table `settings`
--

INSERT INTO `settings` (`id`, `cle`, `valeur`, `groupe`, `description`, `updated_at`) VALUES
(1, 'site_name', 'E-Daara', 'general', 'Nom de la plateforme', '2026-05-17 17:07:30'),
(2, 'site_url', '', 'general', 'URL publique', '2026-05-17 17:07:30'),
(3, 'maintenance_mode', '0', 'general', 'Mode maintenance (0=off, 1=on)', '2026-05-17 17:07:30'),
(4, 'allow_registration', '1', 'auth', 'Autoriser l inscription publique', '2026-05-17 17:07:30'),
(5, 'oauth_google_enabled', '1', 'auth', 'Activer la connexion Google', '2026-05-17 17:07:30'),
(6, 'oauth_facebook_enabled', '1', 'general', NULL, '2026-05-24 22:08:01'),
(7, 'jwt_expiration_min', '60', 'security', 'Durée access token JWT en minutes', '2026-05-17 17:07:30'),
(8, 'refresh_token_days', '30', 'security', 'Durée refresh token en jours', '2026-05-17 17:07:30'),
(9, 'max_upload_size_mo', '500', 'media', 'Taille max upload fichier en Mo', '2026-05-17 17:07:30'),
(10, 'storage_driver', 'minio', 'media', 'Driver stockage : local | minio', '2026-05-17 17:07:30'),
(11, 'rgpd_contact_email', '', 'gdpr', 'Email contact RGPD / CDP', '2026-05-17 17:07:30'),
(12, 'hebergement_pays', 'Sénégal', 'sovereignty', 'Pays d hébergement (souveraineté)', '2026-05-17 17:07:30'),
(13, 'data_residency', 'local', 'sovereignty', 'Résidence des données : local | africain', '2026-05-17 17:07:30');

-- --------------------------------------------------------

--
-- Structure de la table `stats_snapshots`
--

CREATE TABLE `stats_snapshots` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `snap_date` date NOT NULL,
  `total_users` int(10) UNSIGNED DEFAULT 0,
  `total_apprenants` int(10) UNSIGNED DEFAULT 0,
  `total_formateurs` int(10) UNSIGNED DEFAULT 0,
  `total_cours` int(10) UNSIGNED DEFAULT 0,
  `total_inscriptions` int(10) UNSIGNED DEFAULT 0,
  `total_completions` int(10) UNSIGNED DEFAULT 0,
  `total_quizzes` int(10) UNSIGNED DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Snapshots quotidiens pour le tableau de bord Admin';

--
-- Déchargement des données de la table `stats_snapshots`
--

INSERT INTO `stats_snapshots` (`id`, `snap_date`, `total_users`, `total_apprenants`, `total_formateurs`, `total_cours`, `total_inscriptions`, `total_completions`, `total_quizzes`, `created_at`) VALUES
(1, '2026-05-24', 9, 0, 0, 5, 1, 0, 0, '2026-05-24 21:37:43');

-- --------------------------------------------------------

--
-- Structure de la table `student_answers`
--

CREATE TABLE `student_answers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `submission_id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `answer_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Réponse choisie (QCM / vrai-faux)',
  `texte_libre` longtext DEFAULT NULL COMMENT 'Réponse saisie (essai / réponse courte)',
  `est_correcte` tinyint(1) DEFAULT 0,
  `points_obtenus` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Réponses apprenant par question';

-- --------------------------------------------------------

--
-- Structure de la table `submissions`
--

CREATE TABLE `submissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `assessment_id` bigint(20) UNSIGNED NOT NULL,
  `tentative_num` tinyint(3) UNSIGNED DEFAULT 1,
  `score` decimal(6,2) DEFAULT NULL,
  `status` enum('en_cours','soumis','corrige','revu') DEFAULT 'en_cours',
  `debut_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `soumis_at` timestamp NULL DEFAULT NULL,
  `corrige_at` timestamp NULL DEFAULT NULL,
  `feedback` longtext DEFAULT NULL COMMENT 'Feedback formateur (devoirs/projets)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Soumission';

-- --------------------------------------------------------

--
-- Structure de la table `tags`
--

CREATE TABLE `tags` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL COMMENT 'NULL si authentification OAuth uniquement',
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `provider` enum('local','google','facebook') DEFAULT 'local' COMMENT 'Fournisseur d identité OAuth 2.0',
  `provider_id` varchar(255) DEFAULT NULL COMMENT 'ID renvoyé par Google / Facebook',
  `date_naissance` date DEFAULT NULL,
  `pays` varchar(100) DEFAULT 'Sénégal',
  `langue_pref` varchar(10) DEFAULT 'fr' COMMENT 'Préférence de langue (fr, en, wo…)',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete — conformité CDP Sénégal'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Utilisateur — entité centrale RBAC';

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `email_verified_at`, `password`, `phone`, `avatar`, `bio`, `provider`, `provider_id`, `date_naissance`, `pays`, `langue_pref`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'DIAO', 'Papa Birane', 'admin@edaara.sn', '2026-05-17 17:07:53', '$2a$12$QJ6ElZMQy4xDPAlRE7UxHO44/.vcy/0jWPYoUEIn2b5lsPD7ZEV1m', NULL, 'http://localhost:3000/uploads/avatars/avatar_1_1779882849857.jpg', 'Je suis dev fullstack et ingenieur des données avec 6ans d\'expérience.', 'local', NULL, NULL, 'Sénégal', 'fr', 'active', '2026-05-27 14:36:12', NULL, '2026-05-17 17:07:53', '2026-05-27 14:36:12', NULL),
(2, 'Test', 'User', 'test1779040472602@test.sn', NULL, '$2a$12$j9sZSCDjPB5hz1oxSEMuT.0uWk8uMuSc3jHDuSUClwzCMfJ73LQZu', NULL, NULL, NULL, 'local', NULL, NULL, 'Sénégal', 'fr', 'inactive', NULL, NULL, '2026-05-17 17:54:32', '2026-05-27 01:27:43', '2026-05-27 01:27:43'),
(3, 'Test', 'User', 'test1779040515933@test.sn', NULL, '$2a$12$2SCuF35x7IvvLKImNQ/8qurkRbeNvkCXlhtY.hHaza8w5XRnresvu', NULL, NULL, NULL, 'local', NULL, NULL, 'Sénégal', 'fr', 'inactive', NULL, NULL, '2026-05-17 17:55:16', '2026-05-27 01:27:49', '2026-05-27 01:27:49'),
(4, 'Test', 'User', 'test1779040552332@test.sn', NULL, '$2a$12$Y2FJVyOKaPlJDCl8GlyWu.xb53jtSyLehytpMsXbBgy0W5lbRZmua', NULL, NULL, NULL, 'local', NULL, NULL, 'Sénégal', 'fr', 'inactive', NULL, NULL, '2026-05-17 17:55:52', '2026-05-27 01:27:52', '2026-05-27 01:27:52'),
(5, 'Test', 'User', 'test1779040688086@test.sn', NULL, '$2a$12$HeDWQ2ZtQVnRiNAUF06xQ.QxPP.hSoeGKpvuec7S4nThZswVf201W', NULL, NULL, NULL, 'local', NULL, NULL, 'Sénégal', 'fr', 'inactive', NULL, NULL, '2026-05-17 17:58:08', '2026-05-27 12:22:14', '2026-05-27 12:22:14'),
(6, 'Test', 'User', 'test1779041678243@test.sn', NULL, '$2a$12$XJ./2tjXPtoHjdkKnDt.j.IaRRV2//Ee8R2xQZrpiSvwZKMEA5Rku', NULL, NULL, NULL, 'local', NULL, NULL, 'Sénégal', 'fr', 'inactive', NULL, NULL, '2026-05-17 18:14:38', '2026-05-27 11:50:58', '2026-05-27 11:50:58'),
(7, 'Test', 'User', 'test1779041792178@test.sn', NULL, '$2a$12$177mNr2DK6v1ev0PtE7Fw.qqSFp4u26oRYTmVw6QbNefDqAxauP2C', NULL, NULL, NULL, 'local', NULL, NULL, 'Sénégal', 'fr', 'inactive', NULL, NULL, '2026-05-17 18:16:32', '2026-05-27 11:50:54', '2026-05-27 11:50:54'),
(8, 'Test', 'User', 'test1779041809156@test.sn', NULL, '$2a$12$wiQ3Ac8x/bi44OpXgyJV0eimj6sPSvOaxbDVhiQtHH1lehfkxV8Te', NULL, NULL, NULL, 'local', NULL, NULL, 'Sénégal', 'fr', 'inactive', NULL, NULL, '2026-05-17 18:16:49', '2026-05-27 11:50:47', '2026-05-27 11:50:47'),
(9, 'DIAO', 'Penda', 'diaopenda6@gmail.com', NULL, '$2a$12$V3BhNkX6FstDwg75Z1BkDeKwDI17bmY2CAieUwIkTGusDLXhAd9OW', NULL, NULL, NULL, 'local', NULL, NULL, 'Sénégal', 'fr', 'active', '2026-05-27 13:03:41', NULL, '2026-05-17 18:20:52', '2026-05-27 13:03:41', NULL),
(11, 'DIA', 'Mariam', 'diaobirane6@gmail.com', NULL, '$2a$12$IDU0vlLkMrYNszOHqLngSOrQjy5rwZttJ6hs7eRYK9gm9caslf8r.', NULL, NULL, '', 'local', NULL, NULL, 'Sénégal', 'fr', 'active', '2026-05-27 13:14:14', NULL, '2026-05-26 13:34:43', '2026-05-27 13:14:14', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user_badges`
--

CREATE TABLE `user_badges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `badge_id` bigint(20) UNSIGNED NOT NULL,
  `obtenu_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_role`
--

CREATE TABLE `user_role` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user_role`
--

INSERT INTO `user_role` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 3),
(3, 3),
(4, 3),
(5, 3),
(6, 3),
(7, 3),
(8, 3),
(9, 2),
(11, 3);

-- --------------------------------------------------------

--
-- Structure de la table `work_sessions`
--

CREATE TABLE `work_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED DEFAULT NULL,
  `lesson_id` bigint(20) UNSIGNED DEFAULT NULL,
  `debut` timestamp NOT NULL DEFAULT current_timestamp(),
  `fin` timestamp NULL DEFAULT NULL,
  `duree_min` int(10) UNSIGNED DEFAULT 0 COMMENT 'Durée calculée en minutes',
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Classe Session — historique de travail (tableau de bord)';

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `auteur_id` (`auteur_id`);

--
-- Index pour la table `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Index pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_module` (`module`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Index pour la table `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `idx_slug` (`slug`);

--
-- Index pour la table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_serie` (`numero_serie`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `path_id` (`path_id`),
  ADD KEY `idx_numero` (`numero_serie`);

--
-- Index pour la table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_instructor` (`instructor_id`);

--
-- Index pour la table `course_reviews`
--
ALTER TABLE `course_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Index pour la table `course_tag`
--
ALTER TABLE `course_tag`
  ADD PRIMARY KEY (`course_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Index pour la table `course_validations`
--
ALTER TABLE `course_validations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Index pour la table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `derniere_lecon` (`derniere_lecon`),
  ADD KEY `idx_status` (`status`);

--
-- Index pour la table `forum_posts`
--
ALTER TABLE `forum_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `auteur_id` (`auteur_id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `idx_course_lesson` (`course_id`,`lesson_id`);

--
-- Index pour la table `gdpr_requests`
--
ALTER TABLE `gdpr_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `traite_par` (`traite_par`);

--
-- Index pour la table `instructor_profiles`
--
ALTER TABLE `instructor_profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Index pour la table `learner_profiles`
--
ALTER TABLE `learner_profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Index pour la table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_lesson_slug` (`course_id`,`slug`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `idx_ordre` (`ordre`);

--
-- Index pour la table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_lesson_progress` (`user_id`,`lesson_id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `enrollment_id` (`enrollment_id`);

--
-- Index pour la table `media_files`
--
ALTER TABLE `media_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploader_id` (`uploader_id`),
  ADD KEY `idx_context` (`context_type`,`context_id`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expediteur_id` (`expediteur_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `idx_destinataire` (`destinataire_id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lu` (`lu_at`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_user_type` (`user_id`,`type`);

--
-- Index pour la table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_token_hash` (`token_hash`);

--
-- Index pour la table `paths`
--
ALTER TABLE `paths`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `instructor_id` (`instructor_id`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_status` (`status`);

--
-- Index pour la table `path_course`
--
ALTER TABLE `path_course`
  ADD PRIMARY KEY (`path_id`,`course_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `idx_ordre` (`ordre`);

--
-- Index pour la table `path_enrollments`
--
ALTER TABLE `path_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_path_enrollment` (`user_id`,`path_id`),
  ADD KEY `path_id` (`path_id`);

--
-- Index pour la table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assessment_id` (`assessment_id`),
  ADD KEY `idx_ordre` (`ordre`);

--
-- Index pour la table `question_answers`
--
ALTER TABLE `question_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `idx_est_correcte` (`est_correcte`);

--
-- Index pour la table `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assessment_id` (`assessment_id`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `idx_user_quiz` (`user_id`,`assessment_id`);

--
-- Index pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_token_hash` (`token_hash`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Index pour la table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_ordre` (`ordre`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Index pour la table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `idx_ordre` (`ordre`);

--
-- Index pour la table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cle` (`cle`);

--
-- Index pour la table `stats_snapshots`
--
ALTER TABLE `stats_snapshots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_snap_date` (`snap_date`);

--
-- Index pour la table `student_answers`
--
ALTER TABLE `student_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `answer_id` (`answer_id`);

--
-- Index pour la table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_submission` (`user_id`,`assessment_id`,`tentative_num`),
  ADD KEY `assessment_id` (`assessment_id`);

--
-- Index pour la table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_provider` (`provider`);

--
-- Index pour la table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_badge` (`user_id`,`badge_id`),
  ADD KEY `badge_id` (`badge_id`);

--
-- Index pour la table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Index pour la table `work_sessions`
--
ALTER TABLE `work_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_debut` (`debut`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=479;

--
-- AUTO_INCREMENT pour la table `badges`
--
ALTER TABLE `badges`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `course_reviews`
--
ALTER TABLE `course_reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `course_validations`
--
ALTER TABLE `course_validations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `forum_posts`
--
ALTER TABLE `forum_posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `gdpr_requests`
--
ALTER TABLE `gdpr_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `media_files`
--
ALTER TABLE `media_files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `paths`
--
ALTER TABLE `paths`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `path_enrollments`
--
ALTER TABLE `path_enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `question_answers`
--
ALTER TABLE `question_answers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `quiz_results`
--
ALTER TABLE `quiz_results`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT pour la table `resources`
--
ALTER TABLE `resources`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `stats_snapshots`
--
ALTER TABLE `stats_snapshots`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `student_answers`
--
ALTER TABLE `student_answers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `work_sessions`
--
ALTER TABLE `work_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assessments_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `certificates_ibfk_3` FOREIGN KEY (`path_id`) REFERENCES `paths` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `course_reviews`
--
ALTER TABLE `course_reviews`
  ADD CONSTRAINT `course_reviews_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `course_tag`
--
ALTER TABLE `course_tag`
  ADD CONSTRAINT `course_tag_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_tag_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `course_validations`
--
ALTER TABLE `course_validations`
  ADD CONSTRAINT `course_validations_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_validations_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`derniere_lecon`) REFERENCES `lessons` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `forum_posts`
--
ALTER TABLE `forum_posts`
  ADD CONSTRAINT `forum_posts_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forum_posts_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `forum_posts_ibfk_3` FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forum_posts_ibfk_4` FOREIGN KEY (`parent_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `gdpr_requests`
--
ALTER TABLE `gdpr_requests`
  ADD CONSTRAINT `gdpr_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gdpr_requests_ibfk_2` FOREIGN KEY (`traite_par`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `instructor_profiles`
--
ALTER TABLE `instructor_profiles`
  ADD CONSTRAINT `instructor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `learner_profiles`
--
ALTER TABLE `learner_profiles`
  ADD CONSTRAINT `learner_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_3` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `media_files`
--
ALTER TABLE `media_files`
  ADD CONSTRAINT `media_files_ibfk_1` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`expediteur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`destinataire_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `paths`
--
ALTER TABLE `paths`
  ADD CONSTRAINT `paths_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `paths_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `path_course`
--
ALTER TABLE `path_course`
  ADD CONSTRAINT `path_course_ibfk_1` FOREIGN KEY (`path_id`) REFERENCES `paths` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `path_course_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `path_enrollments`
--
ALTER TABLE `path_enrollments`
  ADD CONSTRAINT `path_enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `path_enrollments_ibfk_2` FOREIGN KEY (`path_id`) REFERENCES `paths` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `question_answers`
--
ALTER TABLE `question_answers`
  ADD CONSTRAINT `question_answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD CONSTRAINT `quiz_results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_results_ibfk_2` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_results_ibfk_3` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `student_answers`
--
ALTER TABLE `student_answers`
  ADD CONSTRAINT `student_answers_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_answers_ibfk_3` FOREIGN KEY (`answer_id`) REFERENCES `question_answers` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `work_sessions`
--
ALTER TABLE `work_sessions`
  ADD CONSTRAINT `work_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `work_sessions_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_sessions_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
