const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@edaara.sn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!';

const client = axios.create({ baseURL: BASE, timeout: 10000 });

let testResults = [];
let tokens = {};
let courseIds = [];

const logTest = (method, endpoint, status, success, message = '', details = {}) => {
  const result = {
    timestamp: new Date().toISOString(),
    method,
    endpoint,
    expectedStatus: status,
    success,
    message,
    details
  };
  testResults.push(result);
  
  const icon = success ? '✓ PASS' : '✗ FAIL';
  console.log(`${icon} | ${method.padEnd(6)} ${endpoint.padEnd(40)} [${status}] ${message}`);
};

async function testPublicEndpoints() {
  console.log('\n--- PUBLIC ENDPOINTS ---');
  
  try {
    const h = await client.get('/health');
    logTest('GET', '/health', 200, h.status === 200, 'Health check', { data: h.data });
  } catch (err) {
    logTest('GET', '/health', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const v = await client.get('/api/version');
    logTest('GET', '/api/version', 200, v.status === 200, 'Version', { version: v.data?.version });
  } catch (err) {
    logTest('GET', '/api/version', 200, false, err.response?.data?.message || err.message);
  }
}

async function testPublicCatalogue() {
  console.log('\n--- PUBLIC CATALOGUE ---');
  
  try {
    const courses = await client.get('/api/public/courses');
    logTest('GET', '/api/public/courses', 200, courses.status === 200, 'List published courses', {
      count: courses.data?.data?.courses?.length || 0
    });
  } catch (err) {
    logTest('GET', '/api/public/courses', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const paths = await client.get('/api/public/paths');
    logTest('GET', '/api/public/paths', 200, paths.status === 200, 'List paths', {
      count: paths.data?.data?.paths?.length || 0
    });
  } catch (err) {
    logTest('GET', '/api/public/paths', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const categories = await client.get('/api/public/categories');
    logTest('GET', '/api/public/categories', 200, categories.status === 200, 'List categories', {
      count: categories.data?.data?.categories?.length || 0
    });
  } catch (err) {
    logTest('GET', '/api/public/categories', 200, false, err.response?.data?.message || err.message);
  }
}

async function testAuthentication() {
  console.log('\n--- AUTHENTICATION ---');

  try {
    const email = `test${Date.now()}@test.sn`;
    const res = await client.post('/api/auth/register', {
      nom: 'Test',
      prenom: 'User',
      email,
      password: 'TestPass123!',
      acceptTerms: true
    });
    if (res.status === 201) {
      tokens.newUser = res.data?.data?.accessToken;
      logTest('POST', '/api/auth/register', 201, true, 'Register new user', {
        email,
        hasToken: !!tokens.newUser
      });
    }
  } catch (err) {
    logTest('POST', '/api/auth/register', 201, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await client.post('/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    if (res.status === 200) {
      tokens.admin = res.data?.data?.accessToken;
      tokens.refresh = res.data?.data?.refreshToken;
      logTest('POST', '/api/auth/login', 200, true, 'Admin login', {
        userId: res.data?.data?.userId,
        hasToken: !!tokens.admin
      });
    }
  } catch (err) {
    logTest('POST', '/api/auth/login', 200, false, err.response?.data?.message || err.message);
  }

  if (tokens.refresh) {
    try {
      const res = await client.post('/api/auth/refresh-token', {
        refreshToken: tokens.refresh
      });
      if (res.status === 200) {
        logTest('POST', '/api/auth/refresh-token', 200, true, 'Refresh access token', {
          newTokenExists: !!res.data?.data?.accessToken
        });
      }
    } catch (err) {
      logTest('POST', '/api/auth/refresh-token', 200, false, err.response?.data?.message || err.message);
    }
  }
}

async function testUserEndpoints() {
  console.log('\n--- USER ENDPOINTS ---');
  
  if (!tokens.admin) {
    console.log('Skipping user tests - no admin token');
    return;
  }

  const authed = axios.create({
    baseURL: BASE,
    timeout: 10000,
    headers: { Authorization: `Bearer ${tokens.admin}` }
  });

  try {
    const res = await authed.get('/api/users/profile');
    logTest('GET', '/api/users/profile', 200, res.status === 200, 'Get user profile', {
      email: res.data?.data?.user?.email
    });
  } catch (err) {
    logTest('GET', '/api/users/profile', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.put('/api/users/profile', {
      nom: 'Admin Updated',
      bio: 'Test bio'
    });
    logTest('PUT', '/api/users/profile', 200, res.status === 200, 'Update profile');
  } catch (err) {
    logTest('PUT', '/api/users/profile', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.post('/api/users/change-password', {
      currentPassword: ADMIN_PASSWORD,
      newPassword: ADMIN_PASSWORD
    });
    logTest('POST', '/api/users/change-password', 200, res.status === 200, 'Change password (same)');
  } catch (err) {
    logTest('POST', '/api/users/change-password', 200, false, err.response?.data?.message || err.message);
  }
}

async function testCourseManagement() {
  console.log('\n--- COURSE MANAGEMENT ---');

  if (!tokens.admin) {
    console.log('Skipping course tests - no admin token');
    return;
  }

  const authed = axios.create({
    baseURL: BASE,
    timeout: 10000,
    headers: { Authorization: `Bearer ${tokens.admin}` }
  });

  try {
    const res = await authed.get('/api/courses');
    logTest('GET', '/api/courses', 200, res.status === 200, 'List user courses', {
      count: res.data?.data?.courses?.length || 0
    });
  } catch (err) {
    logTest('GET', '/api/courses', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const courseTitle = `Test Course ${Date.now()}`;
    const res = await authed.post('/api/courses', {
      titre: courseTitle,
      description: 'Automated test course',
      niveau: 'intermediaire',
      duree: 10
    });
    if (res.status === 201) {
      courseIds.push(res.data?.data?.courseId);
      logTest('POST', '/api/courses', 201, true, 'Create course', {
        courseId: res.data?.data?.courseId
      });
    }
  } catch (err) {
    logTest('POST', '/api/courses', 201, false, err.response?.data?.message || err.message);
  }

  if (courseIds.length > 0) {
    const courseId = courseIds[0];

    try {
      const res = await authed.get(`/api/courses/${courseId}`);
      logTest('GET', `/api/courses/${courseId}`, 200, res.status === 200, 'Get course details', {
        title: res.data?.data?.course?.titre
      });
    } catch (err) {
      logTest('GET', `/api/courses/${courseId}`, 200, false, err.response?.data?.message || err.message);
    }

    try {
      const res = await authed.put(`/api/courses/${courseId}`, {
        titre: 'Updated Course Title',
        description: 'Updated description'
      });
      logTest('PUT', `/api/courses/${courseId}`, 200, res.status === 200, 'Update course');
    } catch (err) {
      logTest('PUT', `/api/courses/${courseId}`, 200, false, err.response?.data?.message || err.message);
    }

    try {
      const res = await authed.delete(`/api/courses/${courseId}`);
      logTest('DELETE', `/api/courses/${courseId}`, 200, res.status === 200, 'Delete course');
    } catch (err) {
      logTest('DELETE', `/api/courses/${courseId}`, 200, false, err.response?.data?.message || err.message);
    }
  }
}

async function testAdminPanel() {
  console.log('\n--- ADMIN PANEL ---');

  if (!tokens.admin) {
    console.log('Skipping admin tests - no admin token');
    return;
  }

  const authed = axios.create({
    baseURL: BASE,
    timeout: 10000,
    headers: { Authorization: `Bearer ${tokens.admin}` }
  });

  try {
    const res = await authed.get('/api/admin/dashboard');
    logTest('GET', '/api/admin/dashboard', 200, res.status === 200, 'Dashboard stats', {
      totalUsers: res.data?.data?.total_users,
      publishedCourses: res.data?.data?.published_courses
    });
  } catch (err) {
    logTest('GET', '/api/admin/dashboard', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.get('/api/admin/users');
    logTest('GET', '/api/admin/users', 200, res.status === 200, 'List all users', {
      count: res.data?.data?.users?.length || 0
    });
  } catch (err) {
    logTest('GET', '/api/admin/users', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.put('/api/admin/users/2/status', {
      status: 'active'
    });
    logTest('PUT', '/api/admin/users/2/status', 200, res.status === 200, 'Update user status');
  } catch (err) {
    logTest('PUT', '/api/admin/users/2/status', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.get('/api/admin/courses/pending');
    logTest('GET', '/api/admin/courses/pending', 200, res.status === 200, 'List pending courses', {
      count: res.data?.data?.courses?.length || 0
    });
  } catch (err) {
    logTest('GET', '/api/admin/courses/pending', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.get('/api/admin/audit-logs');
    logTest('GET', '/api/admin/audit-logs', 200, res.status === 200, 'View audit logs', {
      count: res.data?.data?.logs?.length || 0
    });
  } catch (err) {
    logTest('GET', '/api/admin/audit-logs', 200, false, err.response?.data?.message || err.message);
  }
}

async function testDashboard() {
  console.log('\n--- DASHBOARD ---');

  if (!tokens.admin) {
    console.log('Skipping dashboard tests - no admin token');
    return;
  }

  const authed = axios.create({
    baseURL: BASE,
    timeout: 10000,
    headers: { Authorization: `Bearer ${tokens.admin}` }
  });

  try {
    const res = await authed.get('/api/dashboard/student');
    logTest('GET', '/api/dashboard/student', 200, res.status === 200, 'Student dashboard', {
      enrolledCourses: res.data?.data?.enrolled_courses
    });
  } catch (err) {
    logTest('GET', '/api/dashboard/student', 200, false, err.response?.data?.message || err.message);
  }
}

async function testStubEndpoints() {
  console.log('\n--- STUB ENDPOINTS (Not yet fully implemented) ---');

  if (!tokens.admin) {
    console.log('Skipping stub tests - no admin token');
    return;
  }

  const authed = axios.create({
    baseURL: BASE,
    timeout: 10000,
    headers: { Authorization: `Bearer ${tokens.admin}` }
  });

  try {
    const res = await authed.get('/api/paths');
    logTest('GET', '/api/paths', 200, res.status === 200, 'List paths');
  } catch (err) {
    logTest('GET', '/api/paths', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.post('/api/paths', {
      titre: 'Test Path',
      description: 'Test'
    });
    logTest('POST', '/api/paths', 200, res.status === 200, 'Create path');
  } catch (err) {
    logTest('POST', '/api/paths', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.get('/api/lessons');
    logTest('GET', '/api/lessons', 200, res.status === 200, 'List lessons');
  } catch (err) {
    logTest('GET', '/api/lessons', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.get('/api/assessments');
    logTest('GET', '/api/assessments', 200, res.status === 200, 'List assessments');
  } catch (err) {
    logTest('GET', '/api/assessments', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.get('/api/enrollments');
    logTest('GET', '/api/enrollments', 200, res.status === 200, 'List enrollments');
  } catch (err) {
    logTest('GET', '/api/enrollments', 200, false, err.response?.data?.message || err.message);
  }

  try {
    const res = await authed.post('/api/enrollments', {
      course_id: 1
    });
    logTest('POST', '/api/enrollments', 200, res.status === 200, 'Enroll in course');
  } catch (err) {
    logTest('POST', '/api/enrollments', 200, false, err.response?.data?.message || err.message);
  }
}

async function testErrorHandling() {
  console.log('\n--- EDGE CASES & ERROR HANDLING ---');

  try {
    await client.post('/api/auth/login', {
      email: 'invalid@test.sn',
      password: 'wrongpassword'
    });
    logTest('POST', '/api/auth/login', 401, false, 'Should have failed (invalid credentials)');
  } catch (err) {
    logTest('POST', '/api/auth/login', 401, err.response?.status === 401, 'Correct error handling (invalid credentials)', {
      error: err.response?.data?.message
    });
  }

  if (tokens.admin) {
    const authed = axios.create({
      baseURL: BASE,
      timeout: 10000,
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });

    try {
      await authed.get('/api/courses/99999');
      logTest('GET', '/api/courses/99999', 404, false, 'Should have failed (non-existent course)');
    } catch (err) {
      logTest('GET', '/api/courses/99999', 404, err.response?.status === 404, 'Correct error handling (not found)', {
        error: err.response?.data?.message
      });
    }
  }

  try {
    await client.get('/api/public/courses/99999');
    logTest('GET', '/api/public/courses/99999', 404, false, 'Should have failed (non-existent course)');
  } catch (err) {
    logTest('GET', '/api/public/courses/99999', 404, err.response?.status === 404, 'Correct error handling (not found)', {
      error: err.response?.data?.message
    });
  }

  if (tokens.admin) {
    const authed = axios.create({
      baseURL: BASE,
      timeout: 10000,
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });

    try {
      await authed.post('/api/courses', {
        titre: null
      });
      logTest('POST', '/api/courses', 400, false, 'Should have failed (missing titre)');
    } catch (err) {
      logTest('POST', '/api/courses', 400, err.response?.status === 400, 'Correct error handling (validation)', {
        error: err.response?.data?.message
      });
    }
  }
}

async function generateReport() {
  console.log('\n\n====== TEST SUMMARY ======');
  
  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  const total = testResults.length;

  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${total}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);

  if (failed > 0) {
    console.log('\n--- Failed Tests ---');
    testResults
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`${r.method} ${r.endpoint} [${r.expectedStatus}] ${r.message}`);
      });
  }

  // Save detailed report to JSON
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      successRate: ((passed / total) * 100).toFixed(2) + '%'
    },
    tests: testResults
  };

  const reportPath = path.join(__dirname, '..', 'test_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✓ Detailed report saved to: test_report.json`);
}

async function run() {
  console.log('====== E-DAARA COMPREHENSIVE API TEST ======');
  console.log(`Target: ${BASE}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  try {
    await testPublicEndpoints();
    await testPublicCatalogue();
    await testAuthentication();
    await testUserEndpoints();
    await testCourseManagement();
    await testAdminPanel();
    await testDashboard();
    await testStubEndpoints();
    await testErrorHandling();
    await generateReport();
  } catch (err) {
    console.error('Test suite error:', err.message);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
