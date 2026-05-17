/**
 * Routes publiques
 * Accès au catalogue sans authentification requise
 */

const express = require('express');
const { optionalJWT } = require('../middlewares/auth');
const { query, queryOne } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /public/courses:
 *   get:
 *     tags: [Public - Catalogue]
 *     summary: Lister tous les cours publiés
 *     parameters:
 *       - name: category_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: level
 *         in: query
 *         schema:
 *           type: string
 *           enum: [debutant, intermediaire, avance]
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Liste des cours publiés
 */
router.get('/courses', optionalJWT, async (req, res) => {
  try {
    const { category_id, level, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT c.id, c.titre, c.slug, c.description, c.thumbnail,
             c.niveau, c.duree, c.nb_inscrits, c.note_moyenne,
             u.nom as instructor_nom, u.prenom as instructor_prenom,
             cat.name as category_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.status = 'published' AND c.deleted_at IS NULL
    `;

    const params = [];

    if (category_id) {
      sql += ' AND c.category_id = ?';
      params.push(category_id);
    }

    if (level) {
      sql += ' AND c.niveau = ?';
      params.push(level);
    }

    if (search) {
      sql += ' AND (c.titre LIKE ? OR c.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const courses = await query(sql, params);

    // Compter le total
    let countSql = 'SELECT COUNT(*) as total FROM courses WHERE status = "published" AND deleted_at IS NULL';
    const countParams = [];

    if (category_id) {
      countSql += ' AND category_id = ?';
      countParams.push(category_id);
    }
    if (level) {
      countSql += ' AND niveau = ?';
      countParams.push(level);
    }
    if (search) {
      countSql += ' AND (titre LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [{ total }] = await query(countSql, countParams);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des cours'
    });
  }
});

/**
 * @swagger
 * /public/courses/{id}:
 *   get:
 *     tags: [Public - Catalogue]
 *     summary: Détails d'un cours
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du cours
 *       404:
 *         description: Cours non trouvé
 */
router.get('/courses/:id', optionalJWT, async (req, res) => {
  try {
    const course = await queryOne(
      `SELECT c.*, u.nom as instructor_nom, u.prenom as instructor_prenom,
              cat.name as category_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = ? AND c.status = 'published' AND c.deleted_at IS NULL`,
      [req.params.id]
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Charger les sections et leçons
    const sections = await query(
      `SELECT s.id, s.titre, s.description, s.ordre,
              (SELECT COUNT(*) FROM lessons WHERE section_id = s.id) as nb_lessons
       FROM sections s
       WHERE s.course_id = ?
       ORDER BY s.ordre ASC`,
      [course.id]
    );

    res.json({
      success: true,
      data: {
        ...course,
        sections
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du cours'
    });
  }
});

/**
 * @swagger
 * /public/paths:
 *   get:
 *     tags: [Public - Catalogue]
 *     summary: Lister tous les parcours publiés
 */
router.get('/paths', async (req, res) => {
  try {
    const paths = await query(
      `SELECT p.id, p.titre, p.slug, p.description, p.thumbnail,
              p.niveau, p.duree_estimee,
              u.nom as instructor_nom, u.prenom as instructor_prenom,
              (SELECT COUNT(*) FROM path_course WHERE path_id = p.id) as nb_courses
       FROM paths p
       LEFT JOIN users u ON p.instructor_id = u.id
       WHERE p.status = 'published' AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC
       LIMIT 50`
    );

    res.json({
      success: true,
      data: { paths }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des parcours'
    });
  }
});

/**
 * @swagger
 * /public/categories:
 *   get:
 *     tags: [Public - Catalogue]
 *     summary: Lister toutes les catégories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await query(
      `SELECT id, name, slug, description, icon, couleur,
              (SELECT COUNT(*) FROM courses WHERE category_id = categories.id AND status = 'published') as nb_courses
       FROM categories
       WHERE parent_id IS NULL
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des catégories'
    });
  }
});

module.exports = router;
