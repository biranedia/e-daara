/**
 * Routes utilisateurs
 * Gestion du profil, préférences, etc.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext } = require('../middlewares/rbac');
const { query, queryOne } = require('../config/database');

// ─── Multer : upload avatar (stockage temporaire en mémoire) ──────────────────
const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars');

// On stocke en mémoire pour que sharp puisse traiter avant d'écrire sur disque
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max (sharp va compresser)
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG, PNG, WEBP ou GIF sont acceptées'));
    }
  }
});

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Utilisateurs]
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get('/profile', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT u.id, u.email, u.nom, u.prenom, u.avatar, u.bio,
              u.date_naissance, u.langue_pref, u.status,
              u.created_at, u.last_login_at
       FROM users u
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          roles: req.user.roles
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Utilisateurs]
 *     summary: Mettre à jour le profil
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *               langue_pref:
 *                 type: string
 */
router.put('/profile', verifyJWT, async (req, res) => {
  try {
    const { nom, prenom, bio, avatar, langue_pref } = req.body;

    const updates = [];
    const params = [];

    if (nom !== undefined) {
      updates.push('nom = ?');
      params.push(nom);
    }
    if (prenom !== undefined) {
      updates.push('prenom = ?');
      params.push(prenom);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    if (langue_pref !== undefined) {
      updates.push('langue_pref = ?');
      params.push(langue_pref);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour'
      });
    }

    params.push(req.user.id);

    await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

/**
 * POST /users/avatar
 * Upload + redimensionnement automatique 200×200 px (crop centré, JPEG qualité 85)
 */
router.post('/avatar', verifyJWT, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }

    // Supprimer l'ancienne photo locale si elle existe
    const existing = await queryOne('SELECT avatar FROM users WHERE id = ?', [req.user.id]);
    if (existing?.avatar?.includes('/uploads/avatars/')) {
      try {
        const oldPath = path.join(AVATARS_DIR, path.basename(existing.avatar));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (_) { /* ancienne photo introuvable ou externe — on ignore */ }
    }

    // Nom final : toujours .jpg (sharp convertit tout en JPEG)
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
    const filename  = `avatar_${req.user.id}_${Date.now()}.jpg`;
    const destPath  = path.join(AVATARS_DIR, filename);

    // Redimensionner : 200×200 px, crop centré (cover), JPEG qualité 85
    await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85, progressive: true })
      .toFile(destPath);

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${filename}`;

    await query(
      'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?',
      [avatarUrl, req.user.id]
    );

    res.json({ success: true, data: { avatarUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de l'upload de l'avatar" });
  }
});

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     tags: [Utilisateurs]
 *     summary: Changer le mot de passe
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 */
router.post('/change-password', verifyJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Ancien et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    const user = await queryOne(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Ce compte n\'a pas de mot de passe local'
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement du mot de passe'
    });
  }
});

/**
 * GET /users/search?q=term
 * Recherche d'utilisateurs actifs (pour la messagerie, etc.)
 */
router.get('/search', verifyJWT, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ success: true, data: { users: [] } });
    }
    const like = `%${q}%`;
    const users = await query(
      `SELECT id, nom, prenom, email, avatar
       FROM users
       WHERE deleted_at IS NULL
         AND status = 'active'
         AND id != ?
         AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ?)
       ORDER BY prenom, nom
       LIMIT 20`,
      [req.user.id, like, like, like]
    );
    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
  }
});


/**
 * GET /users/contacts
 * Contacts disponibles selon le rôle : admins pour tous,
 * + cours/étudiants pour instructor, + instructeurs pour student.
 */
router.get('/contacts', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const userId = req.user.id;
    const roles  = req.user.roles;

    const adminRole = await queryOne("SELECT id FROM roles WHERE name = 'admin'");
    const admins = adminRole
      ? await query(
          `SELECT u.id, u.nom, u.prenom, u.email
           FROM users u
           INNER JOIN user_role ur ON ur.user_id = u.id
           WHERE ur.role_id = ? AND u.id != ?
           ORDER BY u.nom, u.prenom`,
          [adminRole.id, userId]
        )
      : [];

    if (roles.includes('instructor')) {
      const courses = await query(
        `SELECT id, titre FROM courses WHERE instructor_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      const coursesWithStudents = await Promise.all(
        courses.map(async (course) => {
          const students = await query(
            `SELECT DISTINCT u.id, u.nom, u.prenom, u.email
             FROM users u
             INNER JOIN enrollments e ON e.user_id = u.id
             WHERE e.course_id = ?
             ORDER BY u.nom, u.prenom`,
            [course.id]
          );
          return { id: course.id, titre: course.titre, students };
        })
      );
      return res.json({ success: true, data: { admins, courses: coursesWithStudents } });
    }

    const instructors = await query(
      `SELECT DISTINCT u.id, u.nom, u.prenom, u.email
       FROM users u
       INNER JOIN courses c ON c.instructor_id = u.id
       INNER JOIN enrollments e ON e.course_id = c.id
       WHERE e.user_id = ? AND u.id != ?
       ORDER BY u.nom, u.prenom`,
      [userId, userId]
    );
    res.json({ success: true, data: { admins, instructors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Erreur contacts' });
  }
});
module.exports = router;
