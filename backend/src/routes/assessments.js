const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

const toParam = (value) => (value === undefined ? null : value);

/**
 * @swagger
 * /assessments:
 *   get:
 *     tags: [Évaluations]
 *     summary: Lister les évaluations
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { course_id, lesson_id, status } = req.query;

    let sql = `
      SELECT a.*, c.titre AS course_titre, l.titre AS lesson_titre
      FROM assessments a
      LEFT JOIN courses c ON a.course_id = c.id
      LEFT JOIN lessons l ON a.lesson_id = l.id
      WHERE 1 = 1
    `;
    const params = [];

    if (course_id) {
      sql += ' AND a.course_id = ?';
      params.push(course_id);
    }
    if (lesson_id) {
      sql += ' AND a.lesson_id = ?';
      params.push(lesson_id);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (!req.user.roles.includes('admin') && !req.user.roles.includes('instructor')) {
      sql += " AND a.status = 'published'";
    }

    sql += ' ORDER BY a.ordre ASC, a.created_at DESC';

    const assessments = await query(sql, params);
    res.json({ success: true, data: { assessments } });
  } catch (error) {
    logger.error('Erreur listage évaluations:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des évaluations' });
  }
});

router.get('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const assessment = await queryOne(
      `SELECT a.*, c.titre AS course_titre, l.titre AS lesson_titre
       FROM assessments a
       LEFT JOIN courses c ON a.course_id = c.id
       LEFT JOIN lessons l ON a.lesson_id = l.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Évaluation non trouvée' });
    }

    const questions = await query(
      `SELECT q.*, (SELECT COUNT(*) FROM question_answers qa WHERE qa.question_id = q.id) AS nb_reponses
       FROM questions q
       WHERE q.assessment_id = ?
       ORDER BY q.ordre ASC, q.created_at ASC`,
      [assessment.id]
    );

    res.json({ success: true, data: { assessment, questions } });
  } catch (error) {
    logger.error('Erreur lecture évaluation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de l évaluation' });
  }
});

router.post('/', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  const connection = await getConnection();

  try {
    const {
      course_id,
      lesson_id,
      titre,
      description,
      type,
      score_max,
      score_passage,
      tentatives_max,
      duree_minutes,
      ordre,
      status,
      questions = []
    } = req.body;

    if (!course_id || !titre) {
      return res.status(400).json({ success: false, message: 'course_id et titre requis' });
    }

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO assessments
       (course_id, lesson_id, titre, description, type, score_max, score_passage, tentatives_max, duree_minutes, ordre, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        course_id,
        toParam(lesson_id),
        titre,
        toParam(description),
        type || 'quiz',
        score_max || 100,
        score_passage || 70,
        tentatives_max === undefined ? 3 : tentatives_max,
        toParam(duree_minutes),
        ordre || 0,
        status || 'draft'
      ]
    );

    const assessmentId = result.insertId;

    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question || !question.enonce) continue;

        const [questionResult] = await connection.execute(
          `INSERT INTO questions (assessment_id, enonce, type, points, explication, ordre, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [assessmentId, question.enonce, question.type || 'qcm', question.points || 1, toParam(question.explication), question.ordre === undefined ? i + 1 : question.ordre]
        );

        if (Array.isArray(question.answers)) {
          for (let j = 0; j < question.answers.length; j++) {
            const answer = question.answers[j];
            if (!answer || answer.texte === undefined) continue;

            await connection.execute(
              `INSERT INTO question_answers (question_id, texte, est_correcte, ordre, created_at, updated_at)
               VALUES (?, ?, ?, ?, NOW(), NOW())`,
              [questionResult.insertId, answer.texte, answer.est_correcte ? 1 : 0, answer.ordre === undefined ? j + 1 : answer.ordre]
            );
          }
        }
      }
    }

    await connection.commit();
    await logAudit(req.user.id, 'CREATE_ASSESSMENT', 'quiz', 'assessments', assessmentId, req.ip, req.headers['user-agent']);

    res.status(201).json({ success: true, message: 'Évaluation créée avec succès', data: { assessmentId } });
  } catch (error) {
    await connection.rollback();
    logger.error('Erreur création évaluation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l évaluation' });
  } finally {
    connection.release();
  }
});

router.put('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const assessment = await queryOne('SELECT id FROM assessments WHERE id = ?', [req.params.id]);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Évaluation non trouvée' });
    }

    const allowedFields = ['course_id', 'lesson_id', 'titre', 'description', 'type', 'score_max', 'score_passage', 'tentatives_max', 'duree_minutes', 'ordre', 'status'];
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
    await query(`UPDATE assessments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_ASSESSMENT', 'quiz', 'assessments', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Évaluation mise à jour avec succès' });
  } catch (error) {
    logger.error('Erreur mise à jour évaluation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l évaluation' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const assessment = await queryOne('SELECT id FROM assessments WHERE id = ?', [req.params.id]);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Évaluation non trouvée' });
    }

    await query('DELETE FROM assessments WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_ASSESSMENT', 'quiz', 'assessments', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Évaluation supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur suppression évaluation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l évaluation' });
  }
});

router.get('/:id/questions', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const assessment = await queryOne('SELECT id, course_id FROM assessments WHERE id = ?', [req.params.id]);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Évaluation non trouvée' });
    }

    const questions = await query(
      `SELECT q.*, 
              (SELECT COUNT(*) FROM question_answers qa WHERE qa.question_id = q.id) AS nb_reponses
       FROM questions q
       WHERE q.assessment_id = ?
       ORDER BY q.ordre ASC, q.created_at ASC`,
      [req.params.id]
    );

    res.json({ success: true, data: { questions } });
  } catch (error) {
    logger.error('Erreur listage questions:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des questions' });
  }
});

router.post('/:id/questions', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  const connection = await getConnection();

  try {
    const assessment = await queryOne('SELECT id, course_id FROM assessments WHERE id = ?', [req.params.id]);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Évaluation non trouvée' });
    }

    const { enonce, type, points, explication, ordre, answers = [] } = req.body;
    if (!enonce) {
      return res.status(400).json({ success: false, message: 'enonce requis' });
    }

    const [result] = await connection.execute(
      `INSERT INTO questions (assessment_id, enonce, type, points, explication, ordre, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [req.params.id, enonce, type || 'qcm', points || 1, toParam(explication), ordre || 0]
    );

    if (Array.isArray(answers)) {
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (!answer || answer.texte === undefined) continue;

        await connection.execute(
          `INSERT INTO question_answers (question_id, texte, est_correcte, ordre, created_at, updated_at)
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [result.insertId, answer.texte, answer.est_correcte ? 1 : 0, answer.ordre === undefined ? i + 1 : answer.ordre]
        );
      }
    }

    await logAudit(req.user.id, 'CREATE_QUESTION', 'quiz', 'questions', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Question créée', data: { questionId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création question:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la question' });
  } finally {
    connection.release();
  }
});

router.put('/questions/:questionId', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const question = await queryOne('SELECT id FROM questions WHERE id = ?', [req.params.questionId]);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    const { enonce, type, points, explication, ordre } = req.body;
    const updates = [];
    const params = [];

    if (enonce !== undefined) {
      updates.push('enonce = ?');
      params.push(enonce);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (points !== undefined) {
      updates.push('points = ?');
      params.push(points);
    }
    if (explication !== undefined) {
      updates.push('explication = ?');
      params.push(explication);
    }
    if (ordre !== undefined) {
      updates.push('ordre = ?');
      params.push(ordre);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.questionId);
    await query(`UPDATE questions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_QUESTION', 'quiz', 'questions', req.params.questionId, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Question mise à jour' });
  } catch (error) {
    logger.error('Erreur mise à jour question:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la question' });
  }
});

router.delete('/questions/:questionId', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const question = await queryOne('SELECT id FROM questions WHERE id = ?', [req.params.questionId]);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    await query('DELETE FROM questions WHERE id = ?', [req.params.questionId]);
    await logAudit(req.user.id, 'DELETE_QUESTION', 'quiz', 'questions', req.params.questionId, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Question supprimée' });
  } catch (error) {
    logger.error('Erreur suppression question:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la question' });
  }
});

router.post('/questions/:questionId/answers', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  const connection = await getConnection();

  try {
    const question = await queryOne('SELECT id FROM questions WHERE id = ?', [req.params.questionId]);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    const { texte, est_correcte, ordre } = req.body;
    if (texte === undefined) {
      return res.status(400).json({ success: false, message: 'texte requis' });
    }

    const [result] = await connection.execute(
      `INSERT INTO question_answers (question_id, texte, est_correcte, ordre, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [req.params.questionId, texte, est_correcte ? 1 : 0, ordre || 0]
    );

    await logAudit(req.user.id, 'CREATE_QUESTION_ANSWER', 'quiz', 'question_answers', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Réponse créée', data: { answerId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création réponse:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la réponse' });
  } finally {
    connection.release();
  }
});

router.put('/answers/:answerId', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const answer = await queryOne('SELECT id FROM question_answers WHERE id = ?', [req.params.answerId]);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
    }

    const { texte, est_correcte, ordre } = req.body;
    const updates = [];
    const params = [];

    if (texte !== undefined) {
      updates.push('texte = ?');
      params.push(texte);
    }
    if (est_correcte !== undefined) {
      updates.push('est_correcte = ?');
      params.push(est_correcte ? 1 : 0);
    }
    if (ordre !== undefined) {
      updates.push('ordre = ?');
      params.push(ordre);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.answerId);
    await query(`UPDATE question_answers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_QUESTION_ANSWER', 'quiz', 'question_answers', req.params.answerId, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Réponse mise à jour' });
  } catch (error) {
    logger.error('Erreur mise à jour réponse:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la réponse' });
  }
});

router.delete('/answers/:answerId', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const answer = await queryOne('SELECT id FROM question_answers WHERE id = ?', [req.params.answerId]);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
    }

    await query('DELETE FROM question_answers WHERE id = ?', [req.params.answerId]);
    await logAudit(req.user.id, 'DELETE_QUESTION_ANSWER', 'quiz', 'question_answers', req.params.answerId, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Réponse supprimée' });
  } catch (error) {
    logger.error('Erreur suppression réponse:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la réponse' });
  }
});

module.exports = router;
