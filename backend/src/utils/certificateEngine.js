/**
 * certificateEngine.js — Génération automatique de certificats
 *
 * Déclenchement : quand un apprenant termine un cours (POST /enrollments/:id/complete).
 *
 * Critères pour qu'un certificat soit émis :
 *  1. Le cours est à 100% de progression (status = 'completed')
 *  2. Toutes les leçons du cours sont marquées terminées
 *  3. Aucun certificat n'existe déjà pour ce user/cours
 *
 * Mention calculée selon la moyenne des scores aux quizzes du cours :
 *  < 70%              → pas de certificat (seuil de passage non atteint)
 *  70% – 79%          → Passable
 *  80% – 89%          → Bien
 *  90% – 99%          → Très Bien
 *  100%               → Avec Félicitations
 *
 *  Si le cours n'a aucun quiz → mention "Bien" par défaut (complétion suffit).
 */

const logger = require('./logger');

const generateSerial = () =>
  `CER-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/**
 * @param {number} userId
 * @param {number} courseId
 * @param {Function} query
 * @param {Function} queryOne
 * @returns {Promise<{issued: boolean, numero_serie?: string, mention?: string, reason?: string}>}
 */
async function issueCertificateIfEligible(userId, courseId, query, queryOne) {
  try {
    // ── 1. Vérifier que l'inscription est bien complétée ──────────────────
    const enrollment = await queryOne(
      `SELECT id, progression, status FROM enrollments
       WHERE user_id = ? AND course_id = ? AND status = 'completed'`,
      [userId, courseId]
    );
    if (!enrollment) {
      return { issued: false, reason: 'Cours non encore terminé' };
    }

    // ── 2. Pas de doublon ──────────────────────────────────────────────────
    const existing = await queryOne(
      'SELECT id FROM certificates WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    if (existing) {
      return { issued: false, reason: 'Certificat déjà émis' };
    }

    // ── 3. Vérifier que toutes les leçons sont complétées ─────────────────
    const [totalLessons, completedLessons] = await Promise.all([
      queryOne(
        `SELECT COUNT(*) AS cnt FROM lessons l
         INNER JOIN sections s ON l.section_id = s.id
         WHERE s.course_id = ? AND l.deleted_at IS NULL`,
        [courseId]
      ),
      queryOne(
        `SELECT COUNT(*) AS cnt FROM lesson_progress lp
         INNER JOIN lessons l ON lp.lesson_id = l.id
         INNER JOIN sections s ON l.section_id = s.id
         WHERE s.course_id = ? AND lp.user_id = ? AND lp.completed = 1`,
        [courseId, userId]
      )
    ]);

    const total = totalLessons?.cnt ?? 0;
    const done  = completedLessons?.cnt ?? 0;

    if (total > 0 && done < total) {
      return {
        issued: false,
        reason: `Leçons incomplètes : ${done}/${total} terminées`
      };
    }

    // ── 4. Calculer la mention via les scores quiz du cours ────────────────
    const quizScores = await query(
      `SELECT qr.score, qr.score_max
       FROM quiz_results qr
       INNER JOIN assessments a ON qr.assessment_id = a.id
       WHERE qr.user_id = ? AND a.course_id = ?`,
      [userId, courseId]
    );

    let mention = 'Bien'; // défaut si aucun quiz
    let avgPct  = 100;

    if (quizScores.length > 0) {
      const totalScore = quizScores.reduce((s, r) => s + Number(r.score), 0);
      const totalMax   = quizScores.reduce((s, r) => s + Number(r.score_max || 100), 0);
      avgPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

      if (avgPct < 70) {
        return {
          issued: false,
          reason: `Score moyen insuffisant : ${avgPct}% (minimum requis : 70%)`
        };
      }

      if      (avgPct === 100) mention = 'Avec Félicitations';
      else if (avgPct >= 90)   mention = 'Très Bien';
      else if (avgPct >= 80)   mention = 'Bien';
      else                     mention = 'Passable';
    }

    // ── 5. Émettre le certificat ───────────────────────────────────────────
    const numero_serie = generateSerial();
    await query(
      `INSERT INTO certificates (user_id, course_id, numero_serie, mention, emis_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, courseId, numero_serie, mention]
    );

    logger.info(
      `Certificat auto émis — user #${userId}, cours #${courseId}, ` +
      `mention: ${mention}, score: ${avgPct}%, série: ${numero_serie}`
    );

    return { issued: true, numero_serie, mention, avg_score: avgPct };
  } catch (err) {
    logger.error('Erreur certificateEngine:', err);
    return { issued: false, reason: 'Erreur interne' };
  }
}

module.exports = { issueCertificateIfEligible };
