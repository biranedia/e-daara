/**
 * Routes pour les cours
 * CRUD des cours pour les formateurs
 */

const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [Cours]
 *     summary: Lister les cours de l'utilisateur (formateur) ou tous les cours (admin)
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    let sql, params;

    if (req.user.roles.includes('instructor')) {
      sql = `SELECT * FROM courses WHERE instructor_id = ? ORDER BY created_at DESC`;
      params = [req.user.id];
    } else if (req.user.roles.includes('admin')) {
      sql = `SELECT * FROM courses ORDER BY created_at DESC`;
      params = [];
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const courses = await query(sql, params);
    res.json({ success: true, data: { courses } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des cours'
    });
  }
});

/**
 * @swagger
 * /courses:
 *   post:
 *     tags: [Cours]
 *     summary: Créer un nouveau cours (formateur)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 */
router.post(
  '/',
  verifyJWT,
  loadRBACContext,
  requireRole('instructor', 'admin'),
  async (req, res) => {
    try {
      const {
        titre, description, objectifs, prerequis,
        niveau, duree, category_id, langue
      } = req.body;

      if (!titre) {
        return res.status(400).json({
          success: false,
          message: 'Titre requis'
        });
      }

      const baseSlug = titre
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .substring(0, 200);

      const toParam = (v) => (v === undefined ? null : v);

      // Try to insert with unique slug; on duplicate, append suffix and retry
      let finalSlug = baseSlug || `course-${Date.now()}`;
      let insertResult = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const result = await query(
            `INSERT INTO courses 
             (titre, slug, description, objectifs, prerequis, niveau, duree,
              category_id, instructor_id, langue, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
            [toParam(titre), toParam(finalSlug), toParam(description), toParam(objectifs), toParam(prerequis), toParam(niveau), toParam(duree), toParam(category_id), toParam(req.user.id), toParam(langue)]
          );
          insertResult = result;
          break;
        } catch (err) {
          // If duplicate slug, adjust and retry
          if (err && err.code === 'ER_DUP_ENTRY' && /slug/.test(err.message)) {
            finalSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}-${Date.now().toString().slice(-4)}`;
            continue;
          }
          throw err;
        }
      }

      if (!insertResult) {
        throw new Error('Unable to create course after multiple attempts (slug conflict)');
      }

      const courseId = Array.isArray(insertResult) ? insertResult[0]?.insertId : insertResult?.insertId;

      await logAudit(req.user.id, 'CREATE_COURSE', 'cours', 'courses', courseId, req.ip, req.headers['user-agent']);

      res.status(201).json({
        success: true,
        message: 'Cours créé avec succès',
        data: { courseId }
      });
    } catch (error) {
      logger.error('Erreur création cours:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du cours'
      });
    }
  }
);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     tags: [Cours]
 *     summary: Obtenir un cours
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 */
router.get('/:id', verifyJWT, async (req, res) => {
  try {
    const course = await queryOne(
      'SELECT * FROM courses WHERE id = ?',
      [req.params.id]
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    res.json({ success: true, data: { course } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du cours'
    });
  }
});

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     tags: [Cours]
 *     summary: Mettre à jour un cours
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const course = await queryOne(
      'SELECT instructor_id FROM courses WHERE id = ?',
      [req.params.id]
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { titre, description, objectifs, prerequis, niveau, duree, category_id } = req.body;
    const updates = [];
    const params = [];

    if (titre) {
      updates.push('titre = ?');
      params.push(titre);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (objectifs !== undefined) {
      updates.push('objectifs = ?');
      params.push(objectifs);
    }
    if (prerequis !== undefined) {
      updates.push('prerequis = ?');
      params.push(prerequis);
    }
    if (niveau) {
      updates.push('niveau = ?');
      params.push(niveau);
    }
    if (duree) {
      updates.push('duree = ?');
      params.push(duree);
    }
    if (category_id) {
      updates.push('category_id = ?');
      params.push(category_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(req.params.id);

    await query(
      `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    await logAudit(req.user.id, 'UPDATE_COURSE', 'cours', 'courses', req.params.id, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      message: 'Cours mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du cours'
    });
  }
});

/**
 * POST /courses/:id/submit — Soumettre un cours + validation automatique
 *
 * Critères d'approbation (TOUS doivent être satisfaits) :
 *  1. titre      — non vide, ≥ 5 caractères
 *  2. description — non vide, ≥ 50 caractères
 *  3. objectifs  — rempli, ≥ 30 caractères
 *  4. niveau     — défini (non null)
 *  5. thumbnail  — image de couverture présente
 *  6. sections   — au moins 1 section
 *  7. leçons     — au moins 3 leçons au total dans le cours
 *  8. contenu    — au moins 1 leçon avec contenu (contenu non vide ou url valide)
 *  9. formateur  — compte actif (status = 'active')
 *
 * Si TOUS les critères passent → status = 'published' (approuvé automatiquement).
 * Si au moins un critère échoue → status = 'draft' (rejeté automatiquement).
 * La décision est enregistrée dans course_validations.
 */
router.post('/:id/submit', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const courseId = req.params.id;

    // ── 1. Charger le cours complet ──────────────────────────────────────────
    const course = await queryOne(
      `SELECT c.*, u.status AS instructor_status
       FROM courses c
       INNER JOIN users u ON u.id = c.instructor_id
       WHERE c.id = ? AND c.deleted_at IS NULL`,
      [courseId]
    );
    if (!course) return res.status(404).json({ success: false, message: 'Cours non trouvé' });

    if (course.instructor_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (course.status === 'published') {
      return res.status(400).json({ success: false, message: 'Ce cours est déjà publié' });
    }

    // ── 2. Données structurelles (sections + leçons) ─────────────────────────
    const sections = await query(
      'SELECT id FROM sections WHERE course_id = ? AND deleted_at IS NULL',
      [courseId]
    );
    const sectionIds = sections.map(s => s.id);

    let totalLessons = 0;
    let lessonsWithContent = 0;
    if (sectionIds.length > 0) {
      const placeholders = sectionIds.map(() => '?').join(',');
      const lessons = await query(
        `SELECT contenu, url FROM lessons WHERE section_id IN (${placeholders}) AND deleted_at IS NULL`,
        sectionIds
      );
      totalLessons = lessons.length;
      lessonsWithContent = lessons.filter(l =>
        (l.contenu && l.contenu.trim().length > 0) ||
        (l.url && l.url.trim().length > 0)
      ).length;
    }

    // ── 3. Évaluation des critères ────────────────────────────────────────────
    const criteria = [
      {
        code: 'titre',
        label: 'Titre suffisamment descriptif (≥ 5 caractères)',
        passed: !!(course.titre && course.titre.trim().length >= 5)
      },
      {
        code: 'description',
        label: 'Description complète (≥ 50 caractères)',
        passed: !!(course.description && course.description.trim().length >= 50)
      },
      {
        code: 'objectifs',
        label: 'Objectifs pédagogiques définis (≥ 30 caractères)',
        passed: !!(course.objectifs && course.objectifs.trim().length >= 30)
      },
      {
        code: 'niveau',
        label: 'Niveau du cours défini',
        passed: !!(course.niveau && course.niveau.trim().length > 0)
      },
      {
        code: 'thumbnail',
        label: 'Image de couverture présente',
        passed: !!(course.thumbnail && course.thumbnail.trim().length > 0)
      },
      {
        code: 'sections',
        label: 'Au moins 1 section créée',
        passed: sectionIds.length >= 1
      },
      {
        code: 'lecons',
        label: 'Au moins 3 leçons au total',
        passed: totalLessons >= 3
      },
      {
        code: 'contenu',
        label: 'Au moins 1 leçon avec contenu ou lien',
        passed: lessonsWithContent >= 1
      },
      {
        code: 'formateur',
        label: 'Compte formateur actif',
        passed: course.instructor_status === 'active'
      }
    ];

    const failed = criteria.filter(c => !c.passed);
    const approved = failed.length === 0;
    const decision = approved ? 'approved' : 'rejected';
    const newStatus = approved ? 'published' : 'draft';

    // ── 4. Mettre à jour le statut du cours ───────────────────────────────────
    await query(
      'UPDATE courses SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, courseId]
    );

    // ── 5. Enregistrer la décision dans course_validations ────────────────────
    const commentaire = approved
      ? 'Validation automatique : tous les critères sont satisfaits.'
      : `Validation automatique — refus. Critères non satisfaits :\n${failed.map(c => `• ${c.label}`).join('\n')}`;

    await query(
      `INSERT INTO course_validations (course_id, admin_id, decision, commentaire, created_at)
       VALUES (?, NULL, ?, ?, NOW())`,
      [courseId, decision, commentaire]
    );

    // ── 6. Audit ──────────────────────────────────────────────────────────────
    const auditAction = approved ? 'AUTO_VALIDATE_COURSE_APPROVED' : 'AUTO_VALIDATE_COURSE_REJECTED';
    await logAudit(req.user.id, auditAction, 'cours', 'courses', courseId, req.ip, req.headers['user-agent']);

    // ── 7. Réponse ────────────────────────────────────────────────────────────
    res.json({
      success: true,
      decision,
      message: approved
        ? 'Cours soumis et approuvé automatiquement — il est maintenant publié !'
        : `Cours refusé automatiquement. ${failed.length} critère(s) non satisfait(s).`,
      criteria,
      failed_criteria: failed.map(c => c.label)
    });
  } catch (error) {
    logger.error('Erreur soumission/validation cours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la soumission' });
  }
});

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     tags: [Cours]
 *     summary: Supprimer un cours
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const course = await queryOne(
      'SELECT instructor_id FROM courses WHERE id = ?',
      [req.params.id]
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    await query(
      'UPDATE courses SET deleted_at = NOW() WHERE id = ?',
      [req.params.id]
    );

    await logAudit(req.user.id, 'DELETE_COURSE', 'cours', 'courses', req.params.id, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      message: 'Cours supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du cours'
    });
  }
});

module.exports = router;
