const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// ── Multer — stockage local dans uploads/lessons ─────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../uploads/lessons');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 Mo max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime',
      'application/pdf',
      'audio/mpeg', 'audio/ogg', 'audio/wav',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Type de fichier non autorisé : ${file.mimetype}`));
  }
});

// POST /media/upload — Upload d'un fichier (vidéo, PDF, audio, image)
// Multer est appelé en mode callback pour que ses erreurs de validation
// (type non autorisé, taille dépassée) retournent 400 et non 500.
router.post('/upload', verifyJWT, loadRBACContext, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Fichier trop volumineux (max 200 Mo)' });
      }
      return res.status(400).json({ success: false, message: err.message || 'Erreur lors de l\'upload' });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
      }
      const baseUrl   = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
      const url       = `${baseUrl}/uploads/lessons/${req.file.filename}`;
      const taille_ko = Math.round(req.file.size / 1024);

      const connection = await getConnection();
      const [result] = await connection.execute(
        `INSERT INTO media_files (uploader_id, nom_original, nom_stockage, mime_type, taille_ko, bucket, url_locale, context_type, context_id, created_at)
         VALUES (?, ?, ?, ?, ?, 'local', ?, ?, ?, NOW())`,
        [
          req.user.id, req.file.originalname, req.file.filename,
          req.file.mimetype, taille_ko, url,
          req.body.context_type || null, req.body.context_id || null
        ]
      );
      connection.release();

      res.json({ success: true, data: { url, mediaId: result.insertId, taille_ko, fileName: req.file.originalname } });
    } catch (error) {
      logger.error('Erreur upload fichier:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
    }
  });
});

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { context_type, context_id } = req.query;
    let sql = 'SELECT * FROM media_files WHERE 1 = 1';
    const params = [];

    if (context_type) {
      sql += ' AND context_type = ?';
      params.push(context_type);
    }
    if (context_id) {
      sql += ' AND context_id = ?';
      params.push(context_id);
    }
    if (!req.user.roles.includes('admin')) {
      sql += ' AND uploader_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY created_at DESC LIMIT 200';
    const files = await query(sql, params);
    res.json({ success: true, data: { files } });
  } catch (error) {
    logger.error('Erreur listage media:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des fichiers' });
  }
});

router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await getConnection();
  try {
    const { nom_original, nom_stockage, mime_type, taille_ko, bucket, url_locale, context_type, context_id } = req.body;
    if (!nom_original || !nom_stockage || !mime_type || taille_ko === undefined || !url_locale) {
      return res.status(400).json({ success: false, message: 'Champs fichiers requis manquants' });
    }

    const [result] = await connection.execute(
      `INSERT INTO media_files (uploader_id, nom_original, nom_stockage, mime_type, taille_ko, bucket, url_locale, context_type, context_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [req.user.id, nom_original, nom_stockage, mime_type, taille_ko, bucket || 'edaara', url_locale, context_type || null, context_id || null]
    );

    await logAudit(req.user.id, 'CREATE_MEDIA_FILE', 'media', 'media_files', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Fichier enregistré', data: { mediaId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création media:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l enregistrement du fichier' });
  } finally {
    connection.release();
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const file = await queryOne('SELECT id, uploader_id FROM media_files WHERE id = ?', [req.params.id]);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
    }
    if (file.uploader_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('DELETE FROM media_files WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_MEDIA_FILE', 'media', 'media_files', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Fichier supprimé' });
  } catch (error) {
    logger.error('Erreur suppression media:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du fichier' });
  }
});

module.exports = router;
