/**
 * Routes pour les cours
 * CRUD des cours pour les formateurs
 */

const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne } = require('../config/database');

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

      const slug = titre
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');

      const [result] = await query(
        `INSERT INTO courses 
         (titre, slug, description, objectifs, prerequis, niveau, duree,
          category_id, instructor_id, langue, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
        [titre, slug, description, objectifs, prerequis, niveau, duree, category_id, req.user.id, langue]
      );

      await logAudit(req.user.id, 'CREATE_COURSE', 'courses', result.insertId, req.ip, req.headers['user-agent']);

      res.status(201).json({
        success: true,
        message: 'Cours créé avec succès',
        data: { courseId: result.insertId }
      });
    } catch (error) {
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

    await logAudit(req.user.id, 'UPDATE_COURSE', 'courses', req.params.id, req.ip, req.headers['user-agent']);

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

    await logAudit(req.user.id, 'DELETE_COURSE', 'courses', req.params.id, req.ip, req.headers['user-agent']);

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
