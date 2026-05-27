const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const box = (req.query.box || 'inbox').toLowerCase();
    const q   = (req.query.q || '').trim();

    let sql = `
      SELECT m.*,
             s.nom AS expediteur_nom, s.prenom AS expediteur_prenom, s.email AS expediteur_email,
             r.nom AS destinataire_nom, r.prenom AS destinataire_prenom, r.email AS destinataire_email
      FROM messages m
      LEFT JOIN users s ON m.expediteur_id = s.id
      LEFT JOIN users r ON m.destinataire_id = r.id
      WHERE 1 = 1
    `;
    const params = [];

    if (box === 'sent') {
      sql += ' AND m.expediteur_id = ?';
      params.push(req.user.id);
    } else if (box === 'all' && req.user.roles.includes('admin')) {
      // admin voit tout sans filtre utilisateur
    } else {
      sql += ' AND m.destinataire_id = ?';
      params.push(req.user.id);
    }

    // Recherche full-text sur sujet, corps, nom expéditeur/destinataire
    if (q) {
      sql += ` AND (
        m.sujet LIKE ? OR m.corps LIKE ?
        OR s.nom LIKE ? OR s.prenom LIKE ? OR s.email LIKE ?
        OR r.nom LIKE ? OR r.prenom LIKE ? OR r.email LIKE ?
      )`;
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like, like);
    }

    sql += ' ORDER BY m.created_at DESC LIMIT 300';
    const messages = await query(sql, params);
    res.json({ success: true, data: { messages } });
  } catch (error) {
    logger.error('Erreur listage messages:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des messages' });
  }
});


// Contacts disponibles selon le rôle de l'utilisateur connecté
router.get('/contacts', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const userId = req.user.id;
    const roles  = req.user.roles;

    // Admins : récupérer les IDs du rôle admin puis les users correspondants
    const adminRole = await queryOne(`SELECT id FROM roles WHERE name = 'admin'`);
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
      // Tous les cours de l'instructeur (même logique que GET /courses pour instructor)
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

    // Student : instructeurs des cours où il est inscrit
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
    logger.error('Erreur contacts messagerie:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors du chargement des contacts' });
  }
});
router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await getConnection();
  try {
    const { destinataire_id, sujet, corps, course_id } = req.body;
    if (!destinataire_id || !corps) {
      return res.status(400).json({ success: false, message: 'destinataire_id et corps requis' });
    }

    const recipient = await queryOne('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL', [destinataire_id]);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Destinataire non trouvé' });
    }

    const [result] = await connection.execute(
      `INSERT INTO messages (expediteur_id, destinataire_id, course_id, sujet, corps, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [req.user.id, destinataire_id, course_id || null, sujet || null, corps]
    );

    await logAudit(req.user.id, 'SEND_MESSAGE', 'communication', 'messages', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Message envoyé', data: { messageId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l envoi du message' });
  } finally {
    connection.release();
  }
});

router.put('/:id/read', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const message = await queryOne('SELECT id, destinataire_id FROM messages WHERE id = ?', [req.params.id]);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message non trouvé' });
    }
    if (message.destinataire_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('UPDATE messages SET lu_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message marqué comme lu' });
  } catch (error) {
    logger.error('Erreur lecture message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la lecture du message' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const message = await queryOne('SELECT id, expediteur_id, destinataire_id FROM messages WHERE id = ?', [req.params.id]);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message non trouvé' });
    }
    if (message.expediteur_id !== req.user.id && message.destinataire_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_MESSAGE', 'communication', 'messages', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) {
    logger.error('Erreur suppression message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du message' });
  }
});

module.exports = router;
