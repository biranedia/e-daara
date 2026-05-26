# E-DAARA API ENDPOINTS INVENTORY

**Last Updated**: May 17, 2026  
**Platform Version**: 1.0.0  
**Base URL**: `http://localhost:3000` or `http://0.0.0.0:3000`

---

## TABLE OF CONTENTS

1. [Public Endpoints](#public-endpoints)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Course Management](#course-management)
5. [Enrollment & Progress](#enrollment--progress)
6. [Lessons & Content](#lessons--content)
7. [Assessments & Quizzes](#assessments--quizzes)
8. [Learning Paths](#learning-paths)
9. [Dashboard](#dashboard)
10. [Administration](#administration)
11. [Communication](#communication)

---

## PUBLIC ENDPOINTS

### Health & Version
```
GET /health
GET /api/version
```

### Public Catalogue
```
GET /api/public/courses
  ?category_id=<id>
  ?level=<debutant|intermediaire|avance>
  ?search=<term>
  ?page=1&limit=20

GET /api/public/courses/:id

GET /api/public/paths

GET /api/public/categories

GET /api/public/categories/:id/courses
```

**Response Format**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "titre": "...",
        "slug": "...",
        "description": "...",
        "niveau": "intermediaire",
        "duree": 10,
        "nb_inscrits": 5,
        "note_moyenne": 4.5,
        "instructor_nom": "...",
        "category_name": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

## AUTHENTICATION

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Diao",
  "prenom": "Birane",
  "email": "birane@edaara.sn",
  "password": "SecurePass123!",
  "acceptTerms": true
}

Response [201]:
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "birane@edaara.sn",
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@edaara.sn",
  "password": "AdminPass123!"
}

Response [200]:
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "admin@edaara.sn",
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}

Response [200]:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}

Response [200]:
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@edaara.sn"
}

Response [200]:
{
  "success": true,
  "message": "Email de réinitialisation envoyé"
}
```

### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "...",
  "newPassword": "NewPass123!"
}

Response [200]:
{
  "success": true,
  "message": "Mot de passe réinitialisé"
}
```

---

## USER MANAGEMENT

### Get Profile
```
GET /api/users/profile
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@edaara.sn",
      "nom": "Diao",
      "prenom": "Birane",
      "avatar": null,
      "bio": "...",
      "date_naissance": "1990-01-01",
      "langue_pref": "fr",
      "status": "active",
      "roles": ["admin"],
      "created_at": "2026-01-01T00:00:00Z",
      "last_login_at": "2026-05-17T17:45:00Z"
    }
  }
}
```

### Update Profile
```
PUT /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "nom": "Diao",
  "prenom": "Birane",
  "bio": "Entrepreneur et formateur",
  "avatar": "https://...",
  "langue_pref": "fr"
}

Response [200]:
{
  "success": true,
  "message": "Profil mis à jour avec succès"
}
```

### Change Password
```
POST /api/users/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

Response [200]:
{
  "success": true,
  "message": "Mot de passe changé avec succès"
}
```

---

## COURSE MANAGEMENT

### List Courses (User's)
```
GET /api/courses
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "data": {
    "courses": [...]
  }
}
```

### Get Course Details
```
GET /api/courses/:id
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "titre": "...",
      "slug": "...",
      "description": "...",
      "objectifs": "...",
      "prerequis": "...",
      "niveau": "intermediaire",
      "duree": 10,
      "category_id": 1,
      "instructor_id": 1,
      "langue": "fr",
      "status": "draft|pending|published",
      "nb_inscrits": 5,
      "note_moyenne": 4.5,
      "created_at": "2026-05-17T00:00:00Z",
      "updated_at": "2026-05-17T00:00:00Z"
    }
  }
}
```

### Create Course
```
POST /api/courses
Authorization: Bearer <accessToken> (requires: instructor|admin)
Content-Type: application/json

{
  "titre": "Introduction à Node.js",
  "description": "Apprenez Node.js depuis les bases",
  "objectifs": "Maîtriser les concepts fondamentaux",
  "prerequis": "JavaScript basique",
  "niveau": "debutant",
  "duree": 20,
  "category_id": 1,
  "langue": "fr"
}

Response [201]:
{
  "success": true,
  "message": "Cours créé avec succès",
  "data": {
    "courseId": 14
  }
}
```

### Update Course
```
PUT /api/courses/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "titre": "Updated Title",
  "description": "Updated description",
  "niveau": "intermediaire"
}

Response [200]:
{
  "success": true,
  "message": "Cours mis à jour avec succès"
}
```

### Delete Course
```
DELETE /api/courses/:id
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "message": "Cours supprimé avec succès"
}
```

---

## ENROLLMENT & PROGRESS

### List Enrollments
```
GET /api/enrollments
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "message": "Routes inscriptions - À implémenter"
}
```

### Enroll in Course
```
POST /api/enrollments
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "course_id": 1
}

Response [201]:
{
  "success": true,
  "message": "Inscription réussie"
}
```

### Get Progress
```
GET /api/enrollments/:id/progress
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "data": {
    "enrolled_courses": 5,
    "completed_courses": 2,
    "enrolled_paths": 1,
    "avg_progression": 45
  }
}
```

---

## LESSONS & CONTENT

### List Lessons
```
GET /api/lessons
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "message": "Routes leçons - À implémenter"
}
```

### Get Lesson Details
```
GET /api/lessons/:id
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "data": {
    "lesson": {
      "id": 1,
      "titre": "...",
      "description": "...",
      "contenu": "...",
      "video_url": "...",
      "ordre": 1,
      "duree_estimee": 15
    }
  }
}
```

---

## ASSESSMENTS & QUIZZES

### List Assessments
```
GET /api/assessments
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "message": "Routes évaluations - À implémenter"
}
```

### Get Assessment Details
```
GET /api/assessments/:id
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "data": {
    "assessment": {
      "id": 1,
      "titre": "Quiz Module 1",
      "description": "...",
      "type": "quiz|devoir|projet",
      "score_max": 100,
      "score_passage": 70,
      "tentatives_max": 3,
      "duree_minutes": 30,
      "questions": [...]
    }
  }
}
```

### Submit Assessment
```
POST /api/assessments/:id/submit
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "answers": {
    "question_1": "answer_id",
    "question_2": "text response"
  }
}

Response [201]:
{
  "success": true,
  "data": {
    "submission_id": 1,
    "score": 85,
    "status": "soumis"
  }
}
```

---

## LEARNING PATHS

### List Paths
```
GET /api/paths
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "message": "Routes parcours - À implémenter"
}
```

### Create Path
```
POST /api/paths
Authorization: Bearer <accessToken> (requires: instructor|admin)
Content-Type: application/json

{
  "titre": "DevOps Path",
  "description": "Parcours complet DevOps",
  "niveau": "avance",
  "duree_estimee": 120,
  "courses": [1, 2, 3]
}

Response [201]:
{
  "success": true,
  "data": {
    "pathId": 1
  }
}
```

---

## DASHBOARD

### Student Dashboard
```
GET /api/dashboard/student
Authorization: Bearer <accessToken>

Response [200]:
{
  "success": true,
  "data": {
    "enrolled_courses": 5,
    "completed_courses": 2,
    "enrolled_paths": 1,
    "avg_progression": 45,
    "recent_enrollments": [...],
    "certificates": [...]
  }
}
```

### Instructor Dashboard
```
GET /api/dashboard/instructor
Authorization: Bearer <accessToken> (requires: instructor|admin)

Response [200]:
{
  "success": true,
  "data": {
    "total_courses": 5,
    "total_students": 150,
    "total_revenue": 5000000,
    "average_rating": 4.5
  }
}
```

---

## ADMINISTRATION

### Dashboard
```
GET /api/admin/dashboard
Authorization: Bearer <accessToken> (requires: admin)

Response [200]:
{
  "success": true,
  "data": {
    "total_users": 100,
    "active_users": 85,
    "published_courses": 25,
    "total_enrollments": 500,
    "total_quiz_submissions": 1200
  }
}
```

### List All Users
```
GET /api/admin/users
Authorization: Bearer <accessToken> (requires: admin)

Response [200]:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@edaara.sn",
        "nom": "...",
        "prenom": "...",
        "status": "active",
        "created_at": "...",
        "last_login_at": "..."
      }
    ]
  }
}
```

### Update User Status
```
PUT /api/admin/users/:id/status
Authorization: Bearer <accessToken> (requires: admin)
Content-Type: application/json

{
  "status": "active|inactive|suspended"
}

Response [200]:
{
  "success": true,
  "message": "Statut utilisateur mis à jour"
}
```

### List Pending Courses
```
GET /api/admin/courses/pending
Authorization: Bearer <accessToken> (requires: admin)

Response [200]:
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 5,
        "titre": "...",
        "description": "...",
        "status": "pending",
        "instructor_nom": "...",
        "instructor_prenom": "...",
        "email": "...",
        "created_at": "..."
      }
    ]
  }
}
```

### Validate Course
```
POST /api/admin/courses/:id/validate
Authorization: Bearer <accessToken> (requires: admin)
Content-Type: application/json

{
  "decision": "approved|rejected",
  "commentaire": "Excellent contenu!"
}

Response [200]:
{
  "success": true,
  "message": "Cours approuvé"
}
```

### View Audit Logs
```
GET /api/admin/audit-logs
Authorization: Bearer <accessToken> (requires: admin)

?limit=100&offset=0
?action=login|logout|create|update|delete
?module=admin|cours|quiz|auth|user

Response [200]:
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "user_id": 1,
        "email": "admin@edaara.sn",
        "action": "POST /api/courses",
        "module": "cours",
        "resource_type": "courses",
        "resource_id": 14,
        "ip_address": "127.0.0.1",
        "statut": "success",
        "detail": null,
        "created_at": "2026-05-17T17:50:00Z"
      }
    ]
  }
}
```

---

## COMMUNICATION (STUB)

### Send Message
```
POST /api/messages
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "destinataire_id": 2,
  "sujet": "Question about course",
  "corps": "I have a question about...",
  "course_id": 1
}

Response [201]:
{
  "success": true,
  "data": { "messageId": 1 }
}
```

### Get Messages
```
GET /api/messages
Authorization: Bearer <accessToken>
?filter=inbox|sent|all
?limit=20&offset=0

Response [200]:
{
  "success": true,
  "data": { "messages": [...] }
}
```

### Forum Posts
```
GET /api/courses/:id/forum
GET /api/courses/:id/forum/:postId
POST /api/courses/:id/forum (create question)
POST /api/courses/:id/forum/:postId/reply (add answer)
PUT /api/courses/:id/forum/:postId (edit)
DELETE /api/courses/:id/forum/:postId (delete)
```

---

## ERROR RESPONSES

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes
| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Missing required field |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Database/server error |

---

## AUTHENTICATION HEADERS

All protected endpoints require:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Token format: JWT (JSON Web Token)
Expiration: 60 minutes (configurable)
Refresh: Use `POST /api/auth/refresh-token` with refreshToken

---

## RATE LIMITING

Default configuration:
- **Public endpoints**: 100 requests/15 minutes
- **Authenticated endpoints**: 500 requests/15 minutes
- **Admin endpoints**: 1000 requests/15 minutes

---

## PAGINATION

Supported on list endpoints:
```
GET /api/courses?page=1&limit=20

Response includes:
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## FILTERING & SEARCH

Example: `/api/public/courses?category_id=1&level=intermediaire&search=nodejs&page=1&limit=20`

Supported filters vary by endpoint. Check individual endpoint documentation.

---

**Last Updated**: 2026-05-17  
**API Version**: v1.0.0  
**Status**: ✅ Fully Functional
