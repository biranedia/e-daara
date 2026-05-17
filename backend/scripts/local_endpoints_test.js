const axios = require('axios');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@edaara.sn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!';

const client = axios.create({ baseURL: BASE, timeout: 10000 });

const log = (label, ok, data) => {
  console.log('---', label, ok ? 'OK' : 'FAIL');
  if (data !== undefined) {
    try { console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data); } catch (e) { console.log(data); }
  }
};

async function run() {
  console.log('Running local endpoint checks against', BASE);

  // 1. Health
  try {
    const h = await client.get('/health');
    log('GET /health', true, h.data);
  } catch (err) {
    log('GET /health', false, err.response ? err.response.data : err.message);
    return; // server likely down
  }

  // 2. Version
  try {
    const v = await client.get('/api/version');
    log('GET /api/version', true, v.data);
  } catch (err) {
    log('GET /api/version', false, err.response ? err.response.data : err.message);
  }

  // 3. Public catalogue
  try {
    const pc = await client.get('/api/public/courses');
    log('GET /api/public/courses', true, { count: pc.data.data?.courses?.length ?? null, sample: pc.data.data?.courses?.[0] ?? null });

    const firstId = pc.data.data?.courses?.[0]?.id;
    if (firstId) {
      try {
        const detail = await client.get(`/api/public/courses/${firstId}`);
        log(`GET /api/public/courses/${firstId}`, true, detail.data);
      } catch (e) {
        log(`GET /api/public/courses/${firstId}`, false, e.response ? e.response.data : e.message);
      }
    } else {
      console.log('No public courses found; skipping course detail check.');
    }
  } catch (err) {
    log('GET /api/public/courses', false, err.response ? err.response.data : err.message);
  }

  // paths
  try {
    const p = await client.get('/api/public/paths');
    log('GET /api/public/paths', true, p.data.data?.paths?.length ?? null);
  } catch (err) {
    log('GET /api/public/paths', false, err.response ? err.response.data : err.message);
  }

  // categories
  try {
    const c = await client.get('/api/public/categories');
    log('GET /api/public/categories', true, c.data.data?.categories?.length ?? null);
  } catch (err) {
    log('GET /api/public/categories', false, err.response ? err.response.data : err.message);
  }

  // 4. Try admin login
  let token = null;
  try {
    const res = await client.post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    token = res.data?.data?.accessToken;
    log('POST /api/auth/login', true, { userId: res.data?.data?.userId, tokenExists: !!token });
  } catch (err) {
    log('POST /api/auth/login', false, err.response ? err.response.data : err.message);
  }

  const authed = token ? axios.create({ baseURL: BASE, timeout: 10000, headers: { Authorization: `Bearer ${token}` } }) : null;

  if (!authed) {
    console.log('No token available; protected endpoint checks will be skipped. Provide correct ADMIN_EMAIL and ADMIN_PASSWORD env vars to run them.');
    return;
  }

  // 5. Protected: profile
  try {
    const pr = await authed.get('/api/users/profile');
    log('GET /api/users/profile', true, pr.data.data?.user ?? null);
  } catch (err) {
    log('GET /api/users/profile', false, err.response ? err.response.data : err.message);
  }

  // 6. Create course (instructor/admin)
  let createdCourseId = null;
  try {
    const cr = await authed.post('/api/courses', { titre: 'Test course from script', description: 'Automated test' });
    createdCourseId = cr.data?.data?.courseId;
    log('POST /api/courses', true, { courseId: createdCourseId });
  } catch (err) {
    log('POST /api/courses', false, err.response ? err.response.data : err.message);
  }

  // 7. If created, update and delete
  if (createdCourseId) {
    try {
      await authed.put(`/api/courses/${createdCourseId}`, { titre: 'Updated title' });
      log(`PUT /api/courses/${createdCourseId}`, true);
    } catch (err) {
      log(`PUT /api/courses/${createdCourseId}`, false, err.response ? err.response.data : err.message);
    }

    try {
      await authed.delete(`/api/courses/${createdCourseId}`);
      log(`DELETE /api/courses/${createdCourseId}`, true);
    } catch (err) {
      log(`DELETE /api/courses/${createdCourseId}`, false, err.response ? err.response.data : err.message);
    }
  }

  // 8. Admin endpoints
  try {
    const au = await authed.get('/api/admin/users');
    log('GET /api/admin/users', true, { count: au.data?.data?.users?.length ?? null });
  } catch (err) {
    log('GET /api/admin/users', false, err.response ? err.response.data : err.message);
  }

  try {
    const pending = await authed.get('/api/admin/courses/pending');
    log('GET /api/admin/courses/pending', true, { count: pending.data?.data?.courses?.length ?? 0 });
    const firstPending = pending.data?.data?.courses?.[0];
    if (firstPending) {
      try {
        const v = await authed.post(`/api/admin/courses/${firstPending.id}/validate`, { decision: 'approved', commentaire: 'OK from script' });
        log(`POST /api/admin/courses/${firstPending.id}/validate`, true, v.data);
      } catch (e) {
        log(`POST /api/admin/courses/${firstPending.id}/validate`, false, e.response ? e.response.data : e.message);
      }
    }
  } catch (err) {
    log('GET /api/admin/courses/pending', false, err.response ? err.response.data : err.message);
  }

  try {
    const logs = await authed.get('/api/admin/audit-logs');
    log('GET /api/admin/audit-logs', true, { count: logs.data?.data?.logs?.length ?? null });
  } catch (err) {
    log('GET /api/admin/audit-logs', false, err.response ? err.response.data : err.message);
  }
}

run().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
