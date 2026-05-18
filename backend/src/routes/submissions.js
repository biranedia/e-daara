const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const submissions = await query(
      `SELECT s.*, a.titre AS assessment_titre
       FROM submissions s
       INNER JOIN assessments a ON s.assessment_id = a.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: { submissions } });
  } catch (error) {
    logger.error('Erreur listage soumissions:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des soumissions' });
  }
});

router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await getConnection();
  try {
    const { assessment_id, answers = [] } = req.body;
    if (!assessment_id) {
      return res.status(400).json({ success: false, message: 'assessment_id requis' });
    }

    const assessment = await queryOne('SELECT * FROM assessments WHERE id = ?', [assessment_id]);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Évaluation non trouvée' });
    }

    const latestTentative = await queryOne(
      'SELECT COALESCE(MAX(tentative_num), 0) AS max_tentative FROM submissions WHERE user_id = ? AND assessment_id = ?',
      [req.user.id, assessment_id]
    );
    const tentativeNum = Number(latestTentative?.max_tentative || 0) + 1;

    const [submissionResult] = await connection.execute(
      `INSERT INTO submissions (user_id, assessment_id, tentative_num, status, debut_at, created_at, updated_at)
       VALUES (?, ?, ?, 'soumis', NOW(), NOW(), NOW())`,
      [req.user.id, assessment_id, tentativeNum]
    );

    const questions = await query('SELECT * FROM questions WHERE assessment_id = ? ORDER BY ordre ASC', [assessment_id]);
    let score = 0;
    let maxScore = 0;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      maxScore += Number(question.points || 1);
      const answer = answers.find((item) => String(item.question_id) === String(question.id)) || {};
      let isCorrect = false;
      let points = 0;

      if (question.type === 'qcm' || question.type === 'vrai_faux') {
        if (answer.answer_id) {
          const correct = await queryOne('SELECT id FROM question_answers WHERE id = ? AND question_id = ? AND est_correcte = 1', [answer.answer_id, question.id]);
          isCorrect = !!correct;
        }
      } else if (answer.texte_libre) {
        isCorrect = answer.texte_libre.trim().length > 0;
      }

      if (isCorrect) {
        points = Number(question.points || 1);
        score += points;
      }

      await connection.execute(
        `INSERT INTO student_answers (submission_id, question_id, answer_id, texte_libre, est_correcte, points_obtenus, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [submissionResult.insertId, question.id, answer.answer_id || null, answer.texte_libre || null, isCorrect ? 1 : 0, points]
      );
    }

    const passed = score >= Number(assessment.score_passage || 70) * maxScore / 100;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0;

    await connection.execute(
      `INSERT INTO quiz_results (user_id, assessment_id, submission_id, score, score_max, est_reussi, tentative_num, soumis_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, (SELECT tentative_num FROM submissions WHERE id = ?), NOW(), NOW())`,
      [req.user.id, assessment_id, submissionResult.insertId, score, maxScore, passed ? 1 : 0, submissionResult.insertId]
    );

    await query('UPDATE submissions SET score = ?, corrige_at = NOW(), status = ? WHERE id = ?', [score, 'corrige', submissionResult.insertId]);
    await logAudit(req.user.id, 'SUBMIT_QUIZ', 'quiz', 'submissions', submissionResult.insertId, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      message: 'Soumission enregistrée',
      data: {
        submissionId: submissionResult.insertId,
        score,
        score_max: maxScore,
        percentage,
        est_reussi: passed
      }
    });
  } catch (error) {
    logger.error('Erreur soumission quiz:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la soumission' });
  } finally {
    connection.release();
  }
});

module.exports = router;
