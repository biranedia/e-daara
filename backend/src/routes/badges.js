/**
 * Routes Badges — Gamification E-DAARA
 *
 * Les badges sont attribués AUTOMATIQUEMENT par le moteur badgeEngine.
 * L'admin gère uniquement les DÉFINITIONS (nom, icône, critère, XP).
 * Aucune attribution manuelle n'est nécessaire.
 */

const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const { evaluateBadgesForUser } = require('../utils/badgeEngine');
const logger = require('../utils/logger');

const router = express.Router();

// ── Liste publique de tous les badges (définitions) ──────────────────────────
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const badges = await query(
      `SELECT b.*,
              (SELECT COUNT(*) FROM user_badges ub WHERE ub.badge_id = b.id) AS nb_attributions
       FROM badges b
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, data: { badges } });
  } catch (error) {
    logger.error('Erreur listage badges:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des badges' });
  }
});

// ── Badges de l'utilisateur connecté ─────────────────────────────────────────
router.get('/mine', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const badges = await query(
      `SELECT b.*, ub.obtenu_at
       FROM user_badges ub
       INNER JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = ?
       ORDER BY ub.obtenu_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: { badges } });
  } catch (error) {
    logger.error('Erreur listage badges utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de vos badges' });
  }
});

// ── Statistiques admin : top badges + dernières attributions ─────────────────
router.get('/stats', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const [topBadges, recentAwards] = await Promise.all([
      query(
        `SELECT b.id, b.nom, b.icone, b.xp_valeur,
                COUNT(ub.id) AS nb_attributions
         FROM badges b
         LEFT JOIN user_badges ub ON ub.badge_id = b.id
         GROUP BY b.id
         ORDER BY nb_attributions DESC
         LIMIT 10`
      ),
      query(
        `SELECT ub.obtenu_at, b.nom AS badge_nom, b.icone,
                u.nom AS user_nom, u.prenom AS user_prenom, u.email
         FROM user_badges ub
         INNER JOIN badges b ON ub.badge_id = b.id
         INNER JOIN users u ON ub.user_id = u.id
         ORDER BY ub.obtenu_at DESC
         LIMIT 20`
      )
    ]);
    res.json({ success: true, data: { top_badges: topBadges, recent_awards: recentAwards } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur stats badges' });
  }
});

// ── Créer un badge (admin) ────────────────────────────────────────────────────
router.post('/', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  const connection = await getConnection();
  try {
    const { nom, description, icone, critere, xp_valeur } = req.body;
    if (!nom) {
      return res.status(400).json({ success: false, message: 'nom requis' });
    }

    // critere doit être un objet JSON valide avec type + valeur
    let critereJson = null;
    if (critere) {
      try {
        const parsed = typeof critere === 'string' ? JSON.parse(critere) : critere;
        if (!parsed.type) throw new Error('type manquant');
        critereJson = JSON.stringify(parsed);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'critere invalide — format attendu: {"type":"cours_completes","valeur":5}'
        });
      }
    }

    const [result] = await connection.execute(
      `INSERT INTO badges (nom, description, icone, critere, xp_valeur, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [nom, description || null, icone || null, critereJson, xp_valeur || 0]
    );

    await logAudit(req.user.id, 'CREATE_BADGE', 'gamification', 'badges', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Badge créé', data: { badgeId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création badge:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du badge' });
  } finally {
    connection.release();
  }
});

// ── Modifier un badge (admin) ─────────────────────────────────────────────────
router.put('/:id', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const { nom, description, icone, critere, xp_valeur } = req.body;
    const updates = [];
    const params = [];

    if (nom !== undefined)         { updates.push('nom = ?');         params.push(nom); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (icone !== undefined)       { updates.push('icone = ?');       params.push(icone); }
    if (xp_valeur !== undefined)   { updates.push('xp_valeur = ?');   params.push(xp_valeur); }
    if (critere !== undefined) {
      try {
        const parsed = typeof critere === 'string' ? JSON.parse(critere) : critere;
        updates.push('critere = ?');
        params.push(JSON.stringify(parsed));
      } catch {
        return res.status(400).json({ success: false, message: 'critere invalide' });
      }
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
    }

    params.push(req.params.id);
    await query(`UPDATE badges SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Badge mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour badge' });
  }
});

// ── Supprimer un badge (admin) ────────────────────────────────────────────────
router.delete('/:id', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    await query('DELETE FROM user_badges WHERE badge_id = ?', [req.params.id]);
    await query('DELETE FROM badges WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_BADGE', 'gamification', 'badges', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Badge supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression badge' });
  }
});

// ── Déclencher manuellement l'évaluation pour un utilisateur (admin) ──────────
router.post('/evaluate/:userId', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const awarded = await evaluateBadgesForUser(Number(req.params.userId), query, queryOne);
    res.json({
      success: true,
      message: awarded.length
        ? `${awarded.length} nouveau(x) badge(s) attribué(s)`
        : 'Aucun nouveau badge',
      data: { awarded_badge_ids: awarded }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur évaluation badges' });
  }
});

module.exports = router;
