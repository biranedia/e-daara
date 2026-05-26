/**
 * Routes pour les parcours
 */

const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

const toParam = (value) => (value === undefined ? null : value);

const slugify = (value) => {
  const slug = (value || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-');

  return slug.substring(0, 255);
};

/**
 * @swagger
 * /paths:
 *   get:
 *     tags: [Parcours]
 *     summary: Lister les parcours
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const isAdmin = req.user.roles.includes('admin');
    const isInstructor = req.user.roles.includes('instructor');

    let sql = `
      SELECT p.*, u.nom AS instructor_nom, u.prenom AS instructor_prenom,
             cat.name AS category_name,
             (SELECT COUNT(*) FROM path_course pc WHERE pc.path_id = p.id) AS nb_courses
      FROM paths p
      LEFT JOIN users u ON p.instructor_id = u.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      WHERE p.deleted_at IS NULL
    `;
    const params = [];

    if (!isAdmin && !isInstructor) {
      sql += " AND p.status = 'published'";
    } else if (isInstructor && !isAdmin) {
      sql += ' AND p.instructor_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY p.created_at DESC';
    const paths = await query(sql, params);

    res.json({ success: true, data: { paths } });
  } catch (error) {
    logger.error('Erreur listage parcours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des parcours' });
  }
});

router.get('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const path = await queryOne(
      `SELECT p.*, u.nom AS instructor_nom, u.prenom AS instructor_prenom,
              cat.name AS category_name
       FROM paths p
       LEFT JOIN users u ON p.instructor_id = u.id
       LEFT JOIN categories cat ON p.category_id = cat.id
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [req.params.id]
    );

    if (!path) {
      return res.status(404).json({ success: false, message: 'Parcours non trouvé' });
    }

    const courses = await query(
      `SELECT c.id, c.titre, c.slug, c.description, c.niveau, c.duree, pc.ordre
       FROM path_course pc
       INNER JOIN courses c ON pc.course_id = c.id
       WHERE pc.path_id = ?
       ORDER BY pc.ordre ASC, c.created_at ASC`,
      [path.id]
    );

    res.json({ success: true, data: { path, courses } });
  } catch (error) {
    logger.error('Erreur lecture parcours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du parcours' });
  }
});

/**
 * @swagger
 * /paths:
 *   post:
 *     tags: [Parcours]
 *     summary: Créer un parcours
 *     security:
 *       - BearerAuth: []
 */
router.post('/', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const {
      titre,
      description,
      objectifs,
      prerequis,
      niveau,
      duree_estimee,
      thumbnail,
      category_id,
      course_ids = []
    } = req.body || {};

    const resolvedTitle = titre || `Parcours ${Date.now()}`;
    const baseSlug = slugify(resolvedTitle) || `path-${Date.now()}`;
    let finalSlug = baseSlug;
    let pathId = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const result = await query(
          `INSERT INTO paths
           (titre, slug, description, objectifs, prerequis, niveau, duree_estimee, thumbnail, category_id, instructor_id, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
          [
            resolvedTitle,
            finalSlug,
            toParam(description),
            toParam(objectifs),
            toParam(prerequis),
            toParam(niveau),
            toParam(duree_estimee),
            toParam(thumbnail),
            toParam(category_id),
            req.user.id
          ]
        );

        pathId = Array.isArray(result) ? result[0]?.insertId : result?.insertId;
        if (!pathId) {
          pathId = Date.now();
        }
        break;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          finalSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}-${Date.now().toString().slice(-4)}`;
          continue;
        }
        throw error;
      }
    }

    if (Array.isArray(course_ids) && course_ids.length > 0) {
      for (let index = 0; index < course_ids.length; index++) {
        await query(
          'INSERT IGNORE INTO path_course (path_id, course_id, ordre) VALUES (?, ?, ?)',
          [pathId, course_ids[index], index + 1]
        );
      }
    }

    await logAudit(req.user.id, 'CREATE_PATH', 'cours', 'paths', pathId, req.ip, req.headers['user-agent']);

    res.status(200).json({ success: true, message: 'Parcours créé avec succès', data: { pathId } });
  } catch (error) {
    logger.error('Erreur création parcours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du parcours' });
  }
});

router.put('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const path = await queryOne('SELECT id, instructor_id FROM paths WHERE id = ? AND deleted_at IS NULL', [req.params.id]);

    if (!path) {
      return res.status(404).json({ success: false, message: 'Parcours non trouvé' });
    }

    if (path.instructor_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const allowedFields = ['titre', 'description', 'objectifs', 'prerequis', 'niveau', 'duree_estimee', 'thumbnail', 'category_id', 'status'];
    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.id);
    await query(`UPDATE paths SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

    await logAudit(req.user.id, 'UPDATE_PATH', 'cours', 'paths', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Parcours mis à jour avec succès' });
  } catch (error) {
    logger.error('Erreur mise à jour parcours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du parcours' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const path = await queryOne('SELECT id, instructor_id FROM paths WHERE id = ? AND deleted_at IS NULL', [req.params.id]);

    if (!path) {
      return res.status(404).json({ success: false, message: 'Parcours non trouvé' });
    }

    if (path.instructor_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('UPDATE paths SET deleted_at = NOW(), status = "archived" WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_PATH', 'cours', 'paths', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Parcours supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur suppression parcours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du parcours' });
  }
});

module.exports = router;
