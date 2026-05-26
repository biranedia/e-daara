import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, Enrollment, LessonProgress, StudentDashboardStats, WorkSession } from '../models';

/**
 * Service Inscriptions + Progression + Sessions de travail.
 * /api/enrollments  /api/progress  /api/work-sessions
 */
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly api = inject(ApiService);

  listMine() {
    return this.api.get<ApiResponse<{ enrollments: Enrollment[] }>>('/enrollments');
  }

  /**
   * Tableau de bord apprenant : stats personnelles (cours suivis, terminés, progression moy.)
   * Endpoint : GET /api/dashboard/student
   */
  studentDashboard() {
    return this.api.get<ApiResponse<StudentDashboardStats>>('/dashboard/student');
  }

  enroll(courseId: number) {
    return this.api.post<ApiResponse<{ enrollmentId: number }>>('/enrollments', { course_id: courseId });
  }

  updateProgress(enrollmentId: number, progression: number) {
    return this.api.put<ApiResponse<unknown>>(
      `/enrollments/${enrollmentId}/progress`,
      { progression }
    );
  }

  complete(enrollmentId: number) {
    return this.api.post<ApiResponse<unknown>>(
      `/enrollments/${enrollmentId}/complete`,
      {}
    );
  }

  // ----- Progression leçon -----
  getLessonProgress() {
    return this.api.get<ApiResponse<{ progress: LessonProgress[] }>>('/progress/lessons');
  }

  setLessonProgress(payload: LessonProgress & { enrollment_id?: number; temps_passe?: number }) {
    return this.api.post<ApiResponse<unknown>>('/progress/lessons', {
      lesson_id: payload.lesson_id,
      enrollment_id: payload.enrollment_id,
      completed: payload.status === 'completed',
      temps_passe: payload.temps_passe ?? payload.duration_seconds
    });
  }

  getPathProgress() {
    return this.api.get<ApiResponse<unknown>>('/progress/paths');
  }

  enrollPath(pathId: number) {
    return this.api.post<ApiResponse<unknown>>('/progress/paths', { path_id: pathId });
  }

  updatePathProgress(id: number, payload: { progression?: number; statut?: string }) {
    return this.api.put<ApiResponse<unknown>>(`/progress/paths/${id}`, payload);
  }

  // ----- Sessions de travail (souveraineté : suivi temps réel) -----
  startSession(courseId?: number) {
    return this.api.post<ApiResponse<{ sessionId: number }>>('/work-sessions', {
      course_id: courseId ?? null
    });
  }

  stopSession(sessionId: number) {
    return this.api.put<ApiResponse<unknown>>(`/work-sessions/${sessionId}/stop`, {});
  }

  listSessions() {
    return this.api.get<ApiResponse<{ sessions: WorkSession[] }>>('/work-sessions');
  }
}
