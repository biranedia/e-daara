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
  optionalJWT: (req, res, next) => {
    const roleHeader = req.headers['x-test-role'];
    if (roleHeader) {
      req.user = {
        id: Number(req.headers['x-test-user-id'] || 1),
        roles: roleHeader.split(',').map((role) => role.trim()).filter(Boolean)
      };
    }
    next();
  },
  generateAccessToken: jest.fn(() => 'access-token'),
  generateRefreshToken: jest.fn(() => 'refresh-token'),
  refreshAccessToken: jest.fn()
}));

jest.mock('../src/middlewares/rbac', () => ({
  loadRBACContext: (req, res, next) => next(),
  requireRole: (...allowedRoles) => (req, res, next) => {
    const roles = req.user?.roles || [];
    if (allowedRoles.some((role) => roles.includes(role))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Accès refusé'
    });
  },
  auditLogger: (req, res, next) => next(),
  logAudit: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../src/controllers/authController', () => ({
  register: jest.fn((req, res) => res.status(201).json({
    success: true,
    message: 'Inscription réussie',
    data: {
      userId: 2,
      email: req.body.email,
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    }
  })),
  login: jest.fn((req, res) => res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      userId: 1,
      email: req.body.email,
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    }
  })),
  refreshToken: jest.fn((req, res) => res.json({
    success: true,
    data: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    }
  })),
  logout: jest.fn((req, res) => res.json({ success: true, message: 'Déconnexion réussie' })),
  forgotPassword: jest.fn((req, res) => res.json({ success: true, message: 'Email envoyé' })),
  resetPassword: jest.fn((req, res) => res.json({ success: true, message: 'Mot de passe réinitialisé' }))
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

const database = require('../src/config/database');

const authRoutes = require('../src/routes/auth');
const publicRoutes = require('../src/routes/public');
const usersRoutes = require('../src/routes/users');
const coursesRoutes = require('../src/routes/courses');
const pathsRoutes = require('../src/routes/paths');
const enrollmentsRoutes = require('../src/routes/enrollments');
const assessmentsRoutes = require('../src/routes/assessments');
const lessonsRoutes = require('../src/routes/lessons');
const dashboardRoutes = require('../src/routes/dashboard');
const adminRoutes = require('../src/routes/admin');

const buildApp = () => {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: '2026-05-17T00:00:00.000Z',
      environment: 'test',
      version: '1.0.0'
    });
  });

  app.get('/api/version', (req, res) => {
    res.json({
      version: '1.0.0',
      name: 'E-DAARA Backend',
      environment: 'test'
    });
  });

  app.get('/docs', (req, res) => res.redirect('/api-docs'));

  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/courses', coursesRoutes);
  app.use('/api/paths', pathsRoutes);
  app.use('/api/enrollments', enrollmentsRoutes);
  app.use('/api/assessments', assessmentsRoutes);
  app.use('/api/lessons', lessonsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/admin', adminRoutes);

  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée' });
  });

  return app;
};

const app = buildApp();

beforeEach(() => {
  jest.clearAllMocks();

  database.getConnection.mockResolvedValue({
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
    execute: jest.fn()
  });

  database.query.mockImplementation(async (sql) => {
    if (sql.includes('FROM courses c') && sql.includes("status = 'published'")) {
      return [{ id: 10, titre: 'Cours public', slug: 'cours-public', description: 'Desc', thumbnail: null }];
    }

    if (sql.includes('FROM courses') && sql.includes('COUNT(*) as total')) {
      return [{ total: 1 }];
    }

    if (sql.includes('FROM sections')) {
      return [{ id: 20, titre: 'Section 1', description: 'Section', ordre: 1, nb_lessons: 2 }];
    }

    if (sql.includes('FROM paths p')) {
      return [{ id: 30, titre: 'Parcours public', slug: 'parcours-public' }];
    }

    if (sql.includes('FROM categories')) {
      return [{ id: 40, name: 'Catégorie', slug: 'categorie' }];
    }

    if (sql.includes('SELECT * FROM courses WHERE instructor_id = ?') || sql.includes('SELECT * FROM courses ORDER BY created_at DESC')) {
      return [{ id: 50, titre: 'Cours privé' }];
    }

    if (sql.includes('INSERT INTO courses')) {
      return [{ insertId: 42 }];
    }

    if (sql.includes('UPDATE users SET status = ?')) {
      return [{ affectedRows: 1 }];
    }

    if (sql.includes('FROM users') && sql.includes('deleted_at IS NULL') && sql.includes('ORDER BY created_at DESC')) {
      return [{ id: 1, email: 'admin@edaara.sn', nom: 'Admin', prenom: 'E-DAARA', status: 'active', created_at: '2026-05-17T00:00:00.000Z', last_login_at: null }];
    }

    if (sql.includes('SELECT c.id, c.titre, c.description, c.status')) {
      return [{ id: 60, titre: 'Cours pending', status: 'pending' }];
    }

    if (sql.includes('INSERT INTO course_validations')) {
      return [{ insertId: 7 }];
    }

    if (sql.includes('FROM audit_logs')) {
      return [{ id: 1, action: 'LOGIN', resource: 'users' }];
    }

    if (sql.includes('SELECT u.id, u.email, u.nom, u.prenom, u.avatar, u.bio')) {
      return [{ id: 1, email: 'admin@edaara.sn', nom: 'Admin', prenom: 'E-DAARA', avatar: null, bio: null, date_naissance: null, langue_pref: 'fr', status: 'active', created_at: '2026-05-17T00:00:00.000Z', last_login_at: null }];
    }

    if (sql.includes('SELECT password FROM users WHERE id = ?')) {
      return [{ password: 'hashed-password' }];
    }

    if (sql.includes('SELECT instructor_id FROM courses WHERE id = ?')) {
      return [{ instructor_id: 1 }];
    }

    if (sql.includes('SELECT * FROM courses WHERE id = ?')) {
      return [{ id: 5, titre: 'Cours 5', instructor_id: 1 }];
    }

    if (sql.includes('SELECT c.*, u.nom as instructor_nom')) {
      return [{ id: 10, titre: 'Cours public', instructor_nom: 'Admin', instructor_prenom: 'E-DAARA', category_name: 'Catégorie' }];
    }

    if (sql.includes('SELECT id, name, slug, description, icon, couleur')) {
      return [{ id: 40, name: 'Catégorie', slug: 'categorie', icon: null, couleur: '#000' }];
    }

    if (sql.includes('SELECT') && sql.includes('enrolled_courses') && sql.includes('avg_progression')) {
      return [{ enrolled_courses: 3, completed_courses: 2, enrolled_paths: 1, avg_progression: 75 }];
    }

    if (sql.includes('SELECT') && sql.includes('total_users') && sql.includes('published_courses')) {
      return [{ total_users: 5, active_users: 4, published_courses: 2, total_enrollments: 10, total_quiz_submissions: 7 }];
    }

    return [];
  });

  database.queryOne.mockImplementation(async (sql) => {
    if (sql.includes('SELECT COUNT(*) as total FROM courses')) {
      return { total: 1 };
    }

    if (sql.includes('FROM courses c') && sql.includes("status = 'published'")) {
      return { id: 10, titre: 'Cours public', slug: 'cours-public', description: 'Desc', thumbnail: null, niveau: 'debutant', duree: 60, nb_inscrits: 12, note_moyenne: 4.8, instructor_nom: 'Admin', instructor_prenom: 'E-DAARA', category_name: 'Catégorie' };
    }

    if (sql.includes('SELECT u.id, u.email, u.nom, u.prenom, u.avatar, u.bio')) {
      return { id: 1, email: 'admin@edaara.sn', nom: 'Admin', prenom: 'E-DAARA', avatar: null, bio: null, date_naissance: null, langue_pref: 'fr', status: 'active', created_at: '2026-05-17T00:00:00.000Z', last_login_at: null };
    }

    if (sql.includes('SELECT password FROM users WHERE id = ?')) {
      return { password: 'hashed-password' };
    }

    if (sql.includes('SELECT instructor_id FROM courses WHERE id = ?')) {
      return { instructor_id: 1 };
    }

    if (sql.includes('SELECT * FROM courses WHERE id = ?')) {
      return { id: 5, titre: 'Cours 5', instructor_id: 1 };
    }

    if (sql.includes('SELECT c.*, u.nom as instructor_nom')) {
      return { id: 10, titre: 'Cours public', instructor_nom: 'Admin', instructor_prenom: 'E-DAARA', category_name: 'Catégorie' };
    }

    if (sql.includes('enrolled_courses') && sql.includes('avg_progression')) {
      return { enrolled_courses: 3, completed_courses: 2, enrolled_paths: 1, avg_progression: 75 };
    }

    if (sql.includes('total_users') && sql.includes('published_courses')) {
      return { total_users: 5, active_users: 4, published_courses: 2, total_enrollments: 10, total_quiz_submissions: 7 };
    }

    return null;
  });
});

describe('E-DAARA API endpoints', () => {
  test('exposes the base endpoints', async () => {
    const health = await request(app).get('/health').expect(200);
    expect(health.body).toMatchObject({ status: 'OK', version: '1.0.0' });

    const version = await request(app).get('/api/version').expect(200);
    expect(version.body).toMatchObject({ version: '1.0.0', name: 'E-DAARA Backend' });

    await request(app).get('/docs').expect(302).expect('Location', '/api-docs');
    await request(app).get('/does-not-exist').expect(404);
  });

  test('covers authentication endpoints', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Diallo', prenom: 'Amadou', email: 'amadou@edaara.sn', password: 'SecurePass123!' })
      .expect(201)
      .expect(({ body }) => expect(body.data.email).toBe('amadou@edaara.sn'));

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@edaara.sn', password: 'AdminPass123!' })
      .expect(200)
      .expect(({ body }) => expect(body.data.accessToken).toBe('access-token'));

    await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: 'refresh-token' })
      .expect(200)
      .expect(({ body }) => expect(body.data.refreshToken).toBe('refresh-token'));

    await request(app).post('/api/auth/logout').expect(200);
    await request(app).post('/api/auth/forgot-password').send({ email: 'admin@edaara.sn' }).expect(200);
    await request(app).post('/api/auth/reset-password').send({ token: 'token', newPassword: 'NewPass123!' }).expect(200);
  });

  test('covers public catalogue endpoints', async () => {
    await request(app)
      .get('/api/public/courses?search=java&page=1&limit=10')
      .expect(200)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.data.courses).toHaveLength(1);
        expect(body.data.pagination.total).toBe(1);
      });

    await request(app)
      .get('/api/public/courses/10')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(10);
        expect(body.data.sections).toHaveLength(1);
      });

    await request(app)
      .get('/api/public/paths')
      .expect(200)
      .expect(({ body }) => expect(body.data.paths).toHaveLength(1));

    await request(app)
      .get('/api/public/categories')
      .expect(200)
      .expect(({ body }) => expect(body.data.categories).toHaveLength(1));
  });

  test('covers user endpoints', async () => {
    await request(app)
      .get('/api/users/profile')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect(({ body }) => expect(body.data.user.roles).toContain('admin'));

    await request(app)
      .put('/api/users/profile')
      .set('x-test-role', 'admin')
      .send({ nom: 'Admin', prenom: 'E-DAARA', bio: 'Bio', langue_pref: 'fr' })
      .expect(200);

    await request(app)
      .post('/api/users/change-password')
      .set('x-test-role', 'admin')
      .send({ currentPassword: 'old', newPassword: 'NewPass123!' })
      .expect(200);
  });

  test('covers course endpoints', async () => {
    await request(app)
      .get('/api/courses')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect(({ body }) => expect(body.data.courses).toHaveLength(1));

    await request(app)
      .post('/api/courses')
      .set('x-test-role', 'admin')
      .send({ titre: 'Nouveau cours', description: 'Desc' })
      .expect(201)
      .expect(({ body }) => expect(body.data.courseId).toBe(42));

    await request(app)
      .get('/api/courses/5')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect(({ body }) => expect(body.data.course.id).toBe(5));

    await request(app)
      .put('/api/courses/5')
      .set('x-test-role', 'admin')
      .send({ titre: 'Cours mis à jour' })
      .expect(200);

    await request(app)
      .delete('/api/courses/5')
      .set('x-test-role', 'admin')
      .expect(200);
  });

  test('covers placeholder learning flow endpoints', async () => {
    await request(app).get('/api/paths').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/paths').set('x-test-role', 'admin').expect(200);
    await request(app).get('/api/enrollments').set('x-test-role', 'admin').expect(200);
    await request(app).post('/api/enrollments').set('x-test-role', 'admin').expect(200);
    await request(app).get('/api/lessons').set('x-test-role', 'admin').expect(200);
    await request(app).get('/api/assessments').set('x-test-role', 'admin').expect(200);
    await request(app).get('/api/dashboard/student').set('x-test-role', 'admin').expect(200);
  });

  test('covers administration endpoints', async () => {
    await request(app)
      .get('/api/admin/dashboard')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect(({ body }) => expect(body.data.total_users).toBe(5));

    await request(app)
      .get('/api/admin/users')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect(({ body }) => expect(body.data.users).toHaveLength(1));

    await request(app)
      .put('/api/admin/users/2/status')
      .set('x-test-role', 'admin')
      .send({ status: 'active' })
      .expect(200);

    await request(app)
      .get('/api/admin/courses/pending')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect(({ body }) => expect(body.data.courses).toHaveLength(1));

    await request(app)
      .post('/api/admin/courses/5/validate')
      .set('x-test-role', 'admin')
      .send({ decision: 'approved', commentaire: 'OK' })
      .expect(200);

    await request(app)
      .get('/api/admin/audit-logs')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect(({ body }) => expect(body.data.logs).toHaveLength(1));
  });
});