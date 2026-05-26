const express = require('express');
const request = require('supertest');

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  getConnection: jest.fn()
}));

jest.mock('../src/middlewares/auth', () => ({
  verifyJWT: (req, res, next) => {
    const roleHeader = req.headers['x-test-role'] || 'admin';
    req.user = {
      id: Number(req.headers['x-test-user-id'] || 1),
      roles: roleHeader.split(',').map((role) => role.trim()).filter(Boolean)
    };
    next();
  },
  optionalJWT: (req, res, next) => next(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  refreshAccessToken: jest.fn()
}));

jest.mock('../src/middlewares/rbac', () => ({
  loadRBACContext: (req, res, next) => next(),
  requireRole: (...allowedRoles) => (req, res, next) => {
    const roles = req.user?.roles || [];
    if (allowedRoles.some((role) => roles.includes(role))) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Accès refusé' });
  },
  auditLogger: (req, res, next) => next(),
  logAudit: jest.fn().mockResolvedValue(undefined)
}));

const database = require('../src/config/database');

const notificationsRoutes = require('../src/routes/notifications');
const messagesRoutes = require('../src/routes/messages');
const announcementsRoutes = require('../src/routes/announcements');
const forumRoutes = require('../src/routes/forum');
const assessmentsRoutes = require('../src/routes/assessments');
const certificatesRoutes = require('../src/routes/certificates');
const badgesRoutes = require('../src/routes/badges');
const gdprRoutes = require('../src/routes/gdpr');
const mediaRoutes = require('../src/routes/media');
const settingsRoutes = require('../src/routes/settings');
const statsRoutes = require('../src/routes/stats');
const sectionsRoutes = require('../src/routes/sections');
const resourcesRoutes = require('../src/routes/resources');
const workSessionsRoutes = require('../src/routes/work-sessions');
const submissionsRoutes = require('../src/routes/submissions');
const progressRoutes = require('../src/routes/progress');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/messages', messagesRoutes);
  app.use('/api/announcements', announcementsRoutes);
  app.use('/api/forum', forumRoutes);
  app.use('/api/assessments', assessmentsRoutes);
  app.use('/api/certificates', certificatesRoutes);
  app.use('/api/badges', badgesRoutes);
  app.use('/api/gdpr', gdprRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/sections', sectionsRoutes);
  app.use('/api/resources', resourcesRoutes);
  app.use('/api/work-sessions', workSessionsRoutes);
  app.use('/api/submissions', submissionsRoutes);
  app.use('/api/progress', progressRoutes);
  return app;
};

const app = buildApp();

beforeEach(() => {
  jest.clearAllMocks();

  const connection = {
    execute: jest.fn().mockImplementation(async (sql) => {
      if (typeof sql === 'string' && sql.includes('SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL')) {
        return [[{ total: 5 }]];
      }
      if (typeof sql === 'string' && sql.includes('SELECT COUNT(*) AS total FROM courses WHERE deleted_at IS NULL')) {
        return [[{ total: 2 }]];
      }
      if (typeof sql === 'string' && sql.includes('SELECT COUNT(*) AS total FROM enrollments')) {
        return [[{ total: 3 }]];
      }
      if (typeof sql === 'string' && sql.includes('SELECT COUNT(*) AS total FROM enrollments WHERE status = \'completed\'')) {
        return [[{ total: 1 }]];
      }
      if (typeof sql === 'string' && sql.includes('SELECT COUNT(*) AS total FROM quiz_results')) {
        return [[{ total: 4 }]];
      }

      return [{ insertId: 99, affectedRows: 1 }];
    }),
    release: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
  };
  database.getConnection.mockResolvedValue(connection);

  database.query.mockImplementation(async (sql) => {
    if (sql.includes('FROM notifications n')) {
      return [{ id: 1, user_id: 1, titre: 'Notif', message: 'Message' }];
    }
    if (sql.includes('FROM messages m')) {
      return [{ id: 2, expediteur_id: 1, destinataire_id: 1, sujet: 'Sujet', corps: 'Corps' }];
    }
    if (sql.includes('FROM announcements a')) {
      return [{ id: 3, course_id: 5, titre: 'Annonce', corps: 'Annonce' }];
    }
    if (sql.includes('FROM forum_posts fp') && sql.includes('parent_id IS NULL')) {
      return [{ id: 4, course_id: 5, titre: 'Post', corps: 'Corps' }];
    }
    if (sql.includes('FROM forum_posts fp') && sql.includes('WHERE fp.parent_id = ?')) {
      return [{ id: 41, parent_id: 4, titre: 'Réponse', corps: 'Reply' }];
    }
    if (sql.includes('FROM certificates c')) {
      return [{ id: 5, user_id: 1, numero_serie: 'CER-123' }];
    }
    if (sql.includes('SELECT * FROM badges ORDER BY')) {
      return [{ id: 6, nom: 'Badge' }];
    }
    if (sql.includes('FROM user_badges ub')) {
      return [{ id: 61, nom: 'Badge' }];
    }
    if (sql.includes('FROM gdpr_requests g')) {
      return [{ id: 7, type: 'access' }];
    }
    if (sql.includes('SELECT * FROM gdpr_requests WHERE user_id = ?')) {
      return [{ id: 71, type: 'delete' }];
    }
    if (sql.includes('SELECT * FROM media_files')) {
      return [{ id: 8, nom_original: 'file.pdf' }];
    }
    if (sql.includes('SELECT * FROM settings ORDER BY')) {
      return [{ id: 9, cle: 'site_name', valeur: 'E-DAARA' }];
    }
    if (sql.includes('SELECT * FROM stats_snapshots ORDER BY')) {
      return { snap_date: '2026-05-17', total_users: 5 };
    }
    if (sql.includes('FROM sections s')) {
      return [{ id: 10, titre: 'Section' }];
    }
    if (sql.includes('SELECT * FROM sections WHERE id = ?')) {
      return { id: 10, course_id: 5 };
    }
    if (sql.includes('SELECT * FROM lessons WHERE section_id = ?')) {
      return [{ id: 101, titre: 'Leçon' }];
    }
    if (sql.includes('FROM resources r')) {
      return [{ id: 11, titre: 'Ressource' }];
    }
    if (sql.includes('FROM work_sessions ws')) {
      return [{ id: 12, debut: '2026-05-17T00:00:00.000Z' }];
    }
    if (sql.includes('FROM submissions s')) {
      return [{ id: 13, assessment_id: 21 }];
    }
    if (sql.includes('FROM questions q')) {
      return [{ id: 201, enonce: 'Q1', points: 1 }];
    }
    if (sql.includes('FROM lesson_progress lp')) {
      return [{ id: 14, lesson_id: 101 }];
    }
    if (sql.includes('FROM path_enrollments pe')) {
      return [{ id: 15, path_id: 22 }];
    }
    return [];
  });

  database.queryOne.mockImplementation(async (sql) => {
    if (sql.includes('SELECT id, user_id FROM notifications WHERE id = ?')) {
      return { id: 1, user_id: 1 };
    }
    if (sql.includes('SELECT id, destinataire_id FROM messages WHERE id = ?')) {
      return { id: 2, destinataire_id: 1, expediteur_id: 1 };
    }
    if (sql.includes('SELECT id, expediteur_id, destinataire_id FROM messages WHERE id = ?')) {
      return { id: 2, destinataire_id: 1, expediteur_id: 1 };
    }
    if (sql.includes('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL')) {
      return { id: 1 };
    }
    if (sql.includes('SELECT id, auteur_id FROM announcements WHERE id = ?')) {
      return { id: 3, auteur_id: 1 };
    }
    if (sql.includes('SELECT id, auteur_id FROM forum_posts WHERE id = ?')) {
      return { id: 4, auteur_id: 1 };
    }
    if (sql.includes('WHERE c.numero_serie = ?')) {
      return { id: 5, numero_serie: 'CER-123' };
    }
    if (sql.includes('SELECT id FROM certificates WHERE numero_serie = ?')) {
      return null;
    }
    if (sql.includes('SELECT id, user_id FROM gdpr_requests WHERE id = ?')) {
      return { id: 7, user_id: 1 };
    }
    if (sql.includes('SELECT id, uploader_id FROM media_files WHERE id = ?')) {
      return { id: 8, uploader_id: 1 };
    }
    if (sql.includes('SELECT id FROM settings WHERE cle = ?')) {
      return null;
    }
    if (sql.includes('SELECT id FROM courses WHERE id = ? AND deleted_at IS NULL')) {
      return { id: 5, instructor_id: 1 };
    }
    if (sql.includes('SELECT id, instructor_id FROM courses WHERE id = ? AND deleted_at IS NULL')) {
      return { id: 5, instructor_id: 1 };
    }
    if (sql.includes('SELECT id FROM lessons WHERE id = ?')) {
      return { id: 101 };
    }
    if (sql.includes('SELECT id FROM sections WHERE id = ?')) {
      return { id: 10, course_id: 5 };
    }
    if (sql.includes('SELECT id FROM work_sessions WHERE id = ?')) {
      return { id: 12, user_id: 1, debut: '2026-05-17T00:00:00.000Z' };
    }
    if (sql.includes('SELECT * FROM assessments WHERE id = ?')) {
      return { id: 21, score_passage: 70 };
    }
    if (sql.includes('SELECT id, user_id FROM enrollments WHERE id = ?')) {
      return { id: 31, user_id: 1 };
    }
    if (sql.includes('SELECT id FROM questions WHERE id = ?')) {
      return { id: 201 };
    }
    if (sql.includes('SELECT id FROM question_answers WHERE id = ?')) {
      return { id: 301 };
    }
    if (sql.includes('SELECT id, course_id FROM assessments WHERE id = ?')) {
      return { id: 21, course_id: 5 };
    }
    if (sql.includes('SELECT id FROM paths WHERE id = ? AND deleted_at IS NULL')) {
      return { id: 22 };
    }
    if (sql.includes('SELECT id, user_id FROM path_enrollments WHERE id = ?')) {
      return { id: 32, user_id: 1 };
    }
    if (sql.includes('SELECT * FROM assessments WHERE id = ?')) {
      return { id: 21, score_passage: 70 };
    }
    return null;
  });
});

describe('E-DAARA extended routes', () => {
  test('covers communication routes', async () => {
    await request(app).get('/api/notifications').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/notifications').set('x-test-role', 'admin').send({ user_id: 1, type: 'info', titre: 'T', message: 'M' }).expect(201);
    await request(app).get('/api/messages').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/messages').set('x-test-role', 'admin').send({ destinataire_id: 1, corps: 'Hello' }).expect(201);
    await request(app).get('/api/announcements').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/announcements').set('x-test-role', 'admin').send({ course_id: 5, titre: 'A', corps: 'B' }).expect(201);
    await request(app).get('/api/forum').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/forum').set('x-test-role', 'admin').send({ course_id: 5, corps: 'Question' }).expect(201);
  });

  test('covers achievement and compliance routes', async () => {
    await request(app).get('/api/certificates').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/certificates/issue').set('x-test-role', 'admin').send({ user_id: 1, course_id: 5 }).expect(201);
    await request(app).get('/api/badges').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/badges').set('x-test-role', 'admin').send({ nom: 'Badge' }).expect(201);
    await request(app).post('/api/badges/award').set('x-test-role', 'admin').send({ user_id: 1, badge_id: 6 }).expect(201);
    await request(app).get('/api/gdpr/mine').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/gdpr').set('x-test-role', 'admin').send({ type: 'access' }).expect(201);
    await request(app).get('/api/media').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/media').set('x-test-role', 'admin').send({ nom_original: 'file.pdf', nom_stockage: 'file-1.pdf', mime_type: 'application/pdf', taille_ko: 12, url_locale: '/files/file-1.pdf' }).expect(201);
  });

  test('covers admin config and tracking routes', async () => {
    await request(app).get('/api/settings').set('x-test-role', 'admin').expect(200);
    await request(app).put('/api/settings/site_name').set('x-test-role', 'admin').send({ valeur: 'E-DAARA' }).expect(200);
    await request(app).get('/api/stats/latest').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/stats/refresh').set('x-test-role', 'admin').expect(200);
    await request(app).get('/api/sections?course_id=5').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/sections').set('x-test-role', 'admin').send({ course_id: 5, titre: 'Section' }).expect(201);
    await request(app).get('/api/resources?lesson_id=101').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/resources').set('x-test-role', 'admin').send({ lesson_id: 101, type: 'pdf', titre: 'R', url: '/r.pdf' }).expect(201);
    await request(app).get('/api/work-sessions').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/work-sessions').set('x-test-role', 'admin').send({ course_id: 5, lesson_id: 101 }).expect(201);
  });

  test('covers submission and progress routes', async () => {
    await request(app).get('/api/submissions').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/submissions').set('x-test-role', 'admin').send({ assessment_id: 21, answers: [] }).expect(201);
    await request(app).get('/api/progress/lessons').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/progress/lessons').set('x-test-role', 'admin').send({ lesson_id: 101, enrollment_id: 31, completed: true }).expect(200);
    await request(app).get('/api/progress/paths').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/progress/paths').set('x-test-role', 'admin').send({ path_id: 22 }).expect(200);
  });

  test('covers assessment question and answer routes', async () => {
    await request(app).get('/api/assessments/21/questions').set('x-test-role', 'admin').expect(200);
    await request(app)
      .post('/api/assessments/21/questions')
      .set('x-test-role', 'admin')
      .send({ enonce: 'Nouvelle question', type: 'qcm', points: 2, answers: [{ texte: 'A', est_correcte: false }, { texte: 'B', est_correcte: true }] })
      .expect(201);
    await request(app)
      .put('/api/assessments/questions/201')
      .set('x-test-role', 'admin')
      .send({ enonce: 'Question mise à jour', points: 3 })
      .expect(200);
    await request(app)
      .post('/api/assessments/questions/201/answers')
      .set('x-test-role', 'admin')
      .send({ texte: 'C', est_correcte: false, ordre: 3 })
      .expect(201);
    await request(app)
      .put('/api/assessments/answers/301')
      .set('x-test-role', 'admin')
      .send({ texte: 'Réponse modifiée', est_correcte: true })
      .expect(200);
    await request(app)
      .delete('/api/assessments/answers/301')
      .set('x-test-role', 'admin')
      .expect(200);
    await request(app)
      .delete('/api/assessments/questions/201')
      .set('x-test-role', 'admin')
      .expect(200);
  });
});