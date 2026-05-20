import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Course, Section, Lesson } from '../models';

/**
 * Service Cours — branché sur /api/courses, /api/sections, /api/lessons, /api/public/courses.
 * Aligné sur les routes du backend.
 */
@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly api = inject(ApiService);

  // ----- Catalogue public -----
  listPublic(params: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    level?: string;
  } = {}): Observable<ApiResponse<{ courses: Course[]; total?: number }>> {
    return this.api.get('/public/courses', params as Record<string, string | number>);
  }

  getPublicCourse(id: number) {
    return this.api.get<ApiResponse<{ course: Course; sections?: Section[] }>>(`/public/courses/${id}`);
  }

  listCategories() {
    return this.api.get<ApiResponse<{ categories: { id: number; name: string }[] }>>(
      '/public/categories'
    );
  }

  // ----- Espace formateur / admin -----
  listMine() {
    return this.api.get<ApiResponse<{ courses: Course[] }>>('/courses');
  }

  get(id: number) {
    return this.api.get<ApiResponse<{ course: Course }>>(`/courses/${id}`);
  }

  create(payload: Partial<Course>) {
    return this.api.post<ApiResponse<{ courseId: number }>>('/courses', payload);
  }

  update(id: number, payload: Partial<Course>) {
    return this.api.put<ApiResponse<unknown>>(`/courses/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/courses/${id}`);
  }

  // ----- Sections -----
  listSections(courseId: number) {
    return this.api.get<ApiResponse<{ sections: Section[] }>>(
      '/sections',
      { course_id: courseId }
    );
  }

  createSection(payload: Partial<Section>) {
    return this.api.post<ApiResponse<{ sectionId: number }>>('/sections', payload);
  }

  updateSection(id: number, payload: Partial<Section>) {
    return this.api.put<ApiResponse<unknown>>(`/sections/${id}`, payload);
  }

  deleteSection(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/sections/${id}`);
  }

  // ----- Leçons -----
  listLessons(sectionId: number) {
    return this.api.get<ApiResponse<{ lessons: Lesson[] }>>(
      '/lessons',
      { section_id: sectionId }
    );
  }

  getLesson(id: number) {
    return this.api.get<ApiResponse<{ lesson: Lesson }>>(`/lessons/${id}`);
  }

  createLesson(payload: Partial<Lesson>) {
    // Backend attend `description`, `contenu`, `is_free`, `status` en plus.
    // On envoie un payload complet avec valeurs par défaut sensées.
    return this.api.post<ApiResponse<{ lessonId: number }>>('/lessons', {
      section_id: payload.section_id,
      titre: payload.titre,
      description: (payload as Lesson & { description?: string }).description ?? '',
      contenu: payload.contenu ?? '',
      duree: payload.duree ?? 0,
      ordre: payload.ordre ?? 0,
      is_free: true,
      status: 'draft'
    });
  }

  updateLesson(id: number, payload: Partial<Lesson>) {
    return this.api.put<ApiResponse<unknown>>(`/lessons/${id}`, payload);
  }

  deleteLesson(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/lessons/${id}`);
  }
}
