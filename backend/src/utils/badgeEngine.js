/**
 * badgeEngine.js — Moteur d'attribution automatique de badges
 *
 * Critères supportés (champ `critere` en JSON dans la table `badges`) :
 *  { "type": "cours_completes",      "valeur": 1  }  → N cours terminés
 *  { "type": "cours_inscrits",       "valeur": 5  }  → N cours inscrits
 *  { "type": "quiz_score_max",       "valeur": 80 }  → meilleur score quiz ≥ N %
 *  { "type": "quiz_perfect",         "valeur": 1  }  → au moins 1 quiz à 100 %
 *  { "type": "xp_total",             "valeur": 100 } → XP cumulés ≥ N
 *  { "type": "premiere_inscription", "valeur": 1  }  → toute première inscription
 *
 * Usage :
 *   const { evaluateBadgesForUser } = require('../utils/badgeEngine');
 *   const awarded = await evaluateBadgesForUser(userId, query, queryOne);
 *   // awarded = tableau de badge_id nouvellement attribués
 */

const logger = require('./logger');

/**
 * Évalue tous les badges pour un utilisateur et attribue ceux dont les
 * critères sont désormais satisfaits (sans doublon).
 *
 * @param {number} userId
 * @param {Function} query    — fonction query(sql, params) du pool MySQL
 * @param {Function} queryOne — fonction queryOne(sql, params)
 * @returns {Promise<number[]>} — IDs des badges nouvellement décernés
 */
async function evaluateBadgesForUser(userId, query, queryOne) {
  try {
    // ── 1. Charger tous les badges avec un critère défini ──────────────────
    const allBadges = await query(
      "SELECT id, nom, icone, critere, xp_valeur FROM badges WHERE critere IS NOT NULL AND critere != ''"
    );
    if (!allBadges.length) return [];

    // ── 2. Charger les badges déjà obtenus par l'utilisateur ───────────────
    const already = await query(
      'SELECT badge_id FROM user_badges WHERE user_id = ?',
      [userId]
    );
    const alreadySet = new Set(already.map(r => r.badge_id));

    // ── 3. Récupérer les statistiques de l'utilisateur (une seule fois) ────
    const stats = await getUserStats(userId, query);

    // ── 4. Évaluer chaque badge et attribuer si critère satisfait ──────────
    const newlyAwarded = [];
    for (const badge of allBadges) {
      if (alreadySet.has(badge.id)) continue; // déjà obtenu

      let criteria;
      try {
        criteria = typeof badge.critere === 'string'
          ? JSON.parse(badge.critere)
          : badge.critere;
      } catch {
        continue; // critère mal formé → on saute
      }

      const passes = checkCriteria(criteria, stats);
      if (!passes) continue;

      // Attribuer le badge
      await query(
        'INSERT IGNORE INTO user_badges (user_id, badge_id, obtenu_at) VALUES (?, ?, NOW())',
        [userId, badge.id]
      );

      // Créditer les XP si définis
      if (badge.xp_valeur && badge.xp_valeur > 0) {
        await query(
          `UPDATE users SET xp = COALESCE(xp, 0) + ? WHERE id = ?`,
          [badge.xp_valeur, userId]
        );
      }

      newlyAwarded.push(badge.id);
      logger.info(`Badge #${badge.id} "${badge.nom}" attribué automatiquement à user #${userId}`);
    }

    return newlyAwarded;
  } catch (err) {
    logger.error('Erreur badgeEngine.evaluateBadgesForUser:', err);
    return []; // ne jamais faire planter l'appelant
  }
}

/**
 * Récupère les statistiques gamification d'un utilisateur.
 */
async function getUserStats(userId, query) {
  const [
    coursCompletes,
    coursInscrits,
    quizResults,
    xpRow
  ] = await Promise.all([
    query(
      "SELECT COUNT(*) AS cnt FROM enrollments WHERE user_id = ? AND status = 'completed'",
      [userId]
    ),
    query(
      'SELECT COUNT(*) AS cnt FROM enrollments WHERE user_id = ?',
      [userId]
    ),
    query(
      'SELECT score, score_max FROM quiz_results WHERE user_id = ?',
      [userId]
    ),
    query(
      'SELECT COALESCE(xp, 0) AS xp FROM users WHERE id = ?',
      [userId]
    )
  ]);

  const scores = quizResults.map(r => {
    const max = r.score_max || 100;
    return Math.round((r.score / max) * 100);
  });

  return {
    cours_completes: coursCompletes[0]?.cnt ?? 0,
    cours_inscrits:  coursInscrits[0]?.cnt ?? 0,
    quiz_score_max:  scores.length ? Math.max(...scores) : 0,
    quiz_perfect:    scores.filter(s => s >= 100).length,
    xp_total:        xpRow[0]?.xp ?? 0
  };
}

/**
 * Vérifie si un critère structuré est satisfait par les stats.
 */
function checkCriteria(criteria, stats) {
  if (!criteria || !criteria.type) return false;
  const val = Number(criteria.valeur ?? 1);

  switch (criteria.type) {
    case 'cours_completes':      return stats.cours_completes >= val;
    case 'cours_inscrits':       return stats.cours_inscrits  >= val;
    case 'premiere_inscription': return stats.cours_inscrits  >= 1;
    case 'quiz_score_max':       return stats.quiz_score_max  >= val;
    case 'quiz_perfect':         return stats.quiz_perfect    >= val;
    case 'xp_total':             return stats.xp_total        >= val;
    default:                     return false;
  }
}

module.exports = { evaluateBadgesForUser };
