import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Answer, ApiResponse, Assessment, Question, QuizResult, QuizSubmission } from '../models';

/**
 * Service Évaluations / Quiz / Questions / Réponses / Soumissions.
 * Endpoints : /api/assessments + /api/submissions
 */
@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly api = inject(ApiService);

  list(courseId?: number) {
    return this.api.get<ApiResponse<{ assessments: Assessment[] }>>(
      '/assessments',
      courseId ? { course_id: courseId } : undefined
    );
  }

  get(id: number) {
    return this.api.get<ApiResponse<{ assessment: Assessment }>>(`/assessments/${id}`);
  }

  create(payload: Partial<Assessment>) {
    return this.api.post<ApiResponse<{ assessmentId: number }>>('/assessments', payload);
  }

  update(id: number, payload: Partial<Assessment>) {
    return this.api.put<ApiResponse<unknown>>(`/assessments/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/assessments/${id}`);
  }

  // ----- Questions -----
  listQuestions(assessmentId: number) {
    return this.api.get<ApiResponse<{ questions: Question[] }>>(
      `/assessments/${assessmentId}/questions`
    );
  }

  createQuestion(assessmentId: number, payload: Partial<Question>) {
    return this.api.post<ApiResponse<{ questionId: number }>>(
      `/assessments/${assessmentId}/questions`,
      payload
    );
  }

  updateQuestion(questionId: number, payload: Partial<Question>) {
    return this.api.put<ApiResponse<unknown>>(
      `/assessments/questions/${questionId}`,
      payload
    );
  }

  deleteQuestion(questionId: number) {
    return this.api.delete<ApiResponse<unknown>>(`/assessments/questions/${questionId}`);
  }

  // ----- Réponses -----
  addAnswer(questionId: number, payload: Partial<Answer>) {
    return this.api.post<ApiResponse<unknown>>(
      `/assessments/questions/${questionId}/answers`,
      payload
    );
  }

  updateAnswer(answerId: number, payload: Partial<Answer>) {
    return this.api.put<ApiResponse<unknown>>(`/assessments/answers/${answerId}`, payload);
  }

  deleteAnswer(answerId: number) {
    return this.api.delete<ApiResponse<unknown>>(`/assessments/answers/${answerId}`);
  }

  // ----- Soumissions -----
  submit(payload: QuizSubmission) {
    return this.api.post<ApiResponse<{ result: QuizResult }>>('/submissions', payload);
  }

  listSubmissions() {
    return this.api.get<ApiResponse<{ submissions: QuizResult[] }>>('/submissions');
  }
}
