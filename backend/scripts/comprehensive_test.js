const axios = require('axios');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@edaara.sn';
const ADMIN_PASSWORD = 'AdminPass123!';

let adminToken = null;
let userId = null;
let courseId = null;
let testResults = { passed: 0, failed: 0, errors: [] };

const client = axios.create({ baseURL: BASE, timeout: 10000 });

const log = (endpoint, method, ok, status, message) => {
  const result = ok ? '✓ PASS' : '✗ FAIL';
  console.log(`${result} | ${method.padEnd(6)} ${endpoint.padEnd(40)} [${status}] ${message || ''}`);
  if (ok) {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push({ endpoint, method, status, message });
  }
};

async function test(method, endpoint, data = null, token = null, description = '') {
  try {
    let config = { timeout: 10000 };
    if (token) config.headers = { Authorization: `Bearer ${token}` };

    let response;
    if (method === 'GET') response = await client.get(endpoint, config);
    else if (method === 'POST') response = await client.post(endpoint, data, config);
    else if (method === 'PUT') response = await client.put(endpoint, data, config);
    else if (method === 'DELETE') response = await client.delete(endpoint, config);

    log(endpoint, method, true, response.status, description);
    return response.data;
  } catch (err) {
    const status = err.response?.status || 'ERROR';
    const message = err.response?.data?.message || err.message;
    log(endpoint, method, false, status, message);
    return null;
  }
}

async function run() {
  console.log('\n====== E-DAARA COMPREHENSIVE API TEST ======\n');

  // ============ PUBLIC ENDPOINTS ============
  console.log('\n--- PUBLIC ENDPOINTS ---');
  
  await test('GET', '/health', null, null, 'Health check');
  await test('GET', '/api/version', null, null, 'Version');
  
  console.log('\n--- PUBLIC CATALOGUE ---');
  
  let coursesRes = await test('GET', '/api/public/courses', null, null, 'List published courses');
  if (coursesRes?.data?.courses?.length > 0) {
    courseId = coursesRes.data.courses[0].id;
    await test('GET', `/api/public/courses/${courseId}`, null, null, 'Get course details');
  }

  let pathsRes = await test('GET', '/api/public/paths', null, null, 'List paths');
  let catsRes = await test('GET', '/api/public/categories', null, null, 'List categories');

  // ============ AUTHENTICATION ============
  console.log('\n--- AUTHENTICATION ---');

  // Register new user
  const randomEmail = `test${Date.now()}@test.sn`;
  let registerRes = await test('POST', '/api/auth/register', {
    nom: 'Test',
    prenom: 'User',
    email: randomEmail,
    password: 'TestPass123!',
    acceptTerms: true
  }, null, 'Register new user');

  if (registerRes?.data?.accessToken) {
    console.log(`  → New user token obtained (email: ${randomEmail})`);
  }

  // Login as admin
  let loginRes = await test('POST', '/api/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  }, null, 'Admin login');

  if (loginRes?.data?.accessToken) {
    adminToken = loginRes.data.accessToken;
    userId = loginRes.data.userId;
    console.log(`  → Admin token obtained (ID: ${userId})`);
  }

  // Refresh token
  if (loginRes?.data?.refreshToken) {
    await test('POST', '/api/auth/refresh-token', {
      refreshToken: loginRes.data.refreshToken
    }, null, 'Refresh access token');
  }

  if (!adminToken) {
    console.log('\n⚠ Cannot continue without admin token. Stopping tests.');
    console.log('\nTest Results:', testResults);
    return;
  }

  // ============ USER ENDPOINTS ============
  console.log('\n--- USER ENDPOINTS ---');

  await test('GET', '/api/users/profile', null, adminToken, 'Get user profile');
  
  await test('PUT', '/api/users/profile', {
    nom: 'Admin',
    prenom: 'Updated',
    bio: 'Admin bio'
  }, adminToken, 'Update profile');

  await test('POST', '/api/users/change-password', {
    currentPassword: ADMIN_PASSWORD,
    newPassword: 'AdminPass123!'
  }, adminToken, 'Change password (same)');

  // ============ COURSES ENDPOINTS ============
  console.log('\n--- COURSE MANAGEMENT ---');

  // List courses
  await test('GET', '/api/courses', null, adminToken, 'List user courses');

  // Create course
  let courseRes = await test('POST', '/api/courses', {
    titre: `Test Course ${Date.now()}`,
    description: 'Test course description',
    objectifs: 'Learn testing',
    niveau: 'intermediaire',
    langue: 'fr'
  }, adminToken, 'Create course');

  if (courseRes?.data?.courseId) {
    courseId = courseRes.data.courseId;
    console.log(`  → Course created (ID: ${courseId})`);

    // Get specific course
    await test('GET', `/api/courses/${courseId}`, null, adminToken, 'Get course details');

    // Update course
    await test('PUT', `/api/courses/${courseId}`, {
      titre: 'Updated Course Title',
      description: 'Updated description'
    }, adminToken, 'Update course');

    // Delete course (careful - this removes it)
    // await test('DELETE', `/api/courses/${courseId}`, null, adminToken, 'Delete course');
  }

  // ============ ADMIN ENDPOINTS ============
  console.log('\n--- ADMIN PANEL ---');

  await test('GET', '/api/admin/dashboard', null, adminToken, 'Dashboard stats');
  await test('GET', '/api/admin/users', null, adminToken, 'List all users');

  // Get users and test status update
  let usersRes = await test('GET', '/api/admin/users', null, adminToken);
  if (usersRes?.data?.users?.length > 0) {
    const testUser = usersRes.data.users[0];
    await test('PUT', `/api/admin/users/${testUser.id}/status`, {
      status: 'active'
    }, adminToken, `Update user ${testUser.id} status`);
  }

  // Pending courses
  await test('GET', '/api/admin/courses/pending', null, adminToken, 'List pending courses');

  // Validate course (only if there's a pending course)
  let pendingRes = await test('GET', '/api/admin/courses/pending', null, adminToken);
  if (pendingRes?.data?.courses?.length > 0) {
    const pendingCourse = pendingRes.data.courses[0];
    await test('POST', `/api/admin/courses/${pendingCourse.id}/validate`, {
      decision: 'approved',
      commentaire: 'Approved by test'
    }, adminToken, `Validate course ${pendingCourse.id}`);
  }

  // Audit logs
  await test('GET', '/api/admin/audit-logs', null, adminToken, 'View audit logs');

  // ============ DASHBOARD ENDPOINTS ============
  console.log('\n--- DASHBOARD ---');

  await test('GET', '/api/dashboard/student', null, adminToken, 'Student dashboard');

  // ============ STUB ENDPOINTS (Not yet implemented) ============
  console.log('\n--- STUB ENDPOINTS (Not yet fully implemented) ---');

  await test('GET', '/api/paths', null, adminToken, 'List paths');
  await test('POST', '/api/paths', { titre: 'Test Path' }, adminToken, 'Create path');

  await test('GET', '/api/lessons', null, adminToken, 'List lessons');

  await test('GET', '/api/assessments', null, adminToken, 'List assessments');

  await test('GET', '/api/enrollments', null, adminToken, 'List enrollments');
  await test('POST', '/api/enrollments', { course_id: 1 }, adminToken, 'Enroll in course');

  // ============ EDGE CASES ============
  console.log('\n--- EDGE CASES & ERROR HANDLING ---');

  await test('POST', '/api/auth/login', {
    email: 'nonexistent@test.sn',
    password: 'wrongpass'
  }, null, 'Login with wrong credentials');

  await test('GET', '/api/courses/99999', null, adminToken, 'Get non-existent course');
  await test('GET', '/api/public/courses/99999', null, null, 'Get non-existent public course');
  await test('POST', '/api/courses', { titre: '' }, adminToken, 'Create course with empty title');

  // ============ SUMMARY ============
  console.log('\n====== TEST SUMMARY ======');
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(`Total: ${testResults.passed + testResults.failed}`);

  if (testResults.failed > 0) {
    console.log('\n--- Failed Tests ---');
    testResults.errors.forEach(err => {
      console.log(`${err.method} ${err.endpoint} [${err.status}] ${err.message}`);
    });
  }

  console.log('\n');
}

run().catch(err => {
  console.error('Test runner error:', err.message);
  process.exit(1);
});
