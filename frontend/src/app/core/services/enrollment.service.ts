import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, Enrollment, LessonProgress, WorkSession } from '../models';

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
    // Backend attend { lesson_id, enrollment_id, completed (boolean), temps_passe }
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

  // ----- Sessions de travail (souveraineté : suivi temps réel) -----
  startSession(courseId?: number) {
    return this.api.post<ApiResponse<{ sessionId: number }>>('/work-sessions', {
      course_id: courseId
    });
  }

  stopSession(id: number) {
    return this.api.put<ApiResponse<unknown>>(`/work-sessions/${id}/stop`, {});
  }

  listSessions() {
    return this.api.get<ApiResponse<{ sessions: WorkSession[] }>>('/work-sessions');
  }
}
