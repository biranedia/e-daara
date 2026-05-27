import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Course, Section, Lesson, Resource } from '../models';

// Backend spread le cours directement dans data pour GET /public/courses/:id
type PublicCourseResponse = Course & { sections?: Section[] };

/**
 * Service Cours — branché sur /api/courses, /api/sections, /api/lessons, /api/public/courses.
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
    // Backend : res.json({ success: true, data: { ...course, sections } })
    return this.api.get<ApiResponse<PublicCourseResponse>>(`/public/courses/${id}`);
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

  submit(id: number) {
    return this.api.post<ApiResponse<unknown> & {
      decision?: 'approved' | 'rejected';
      message?: string;
      criteria?: Array<{ code: string; label: string; passed: boolean }>;
      failed_criteria?: string[];
    }>(`/courses/${id}/submit`, {});
  }

  // ----- Sections -----
  listSections(courseId: number) {
    return this.api.get<ApiResponse<{ sections: Section[] }>>(
      '/sections',
      { course_id: courseId }
    );
  }

  getSection(id: number) {
    // Backend : { section, lessons } — lessons séparé, PAS imbriqué dans section
    return this.api.get<ApiResponse<{ section: Section; lessons: Lesson[] }>>(`/sections/${id}`);
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
    // Backend : { lesson, resources }
    return this.api.get<ApiResponse<{ lesson: Lesson; resources: Resource[] }>>(`/lessons/${id}`);
  }

  createLesson(payload: Partial<Lesson>) {
    // Backend requiert : section_id + course_id + titre (sans course_id => 400)
    return this.api.post<ApiResponse<{ lessonId: number }>>('/lessons', {
      section_id:  payload.section_id,
      course_id:   payload.course_id,
      titre:       payload.titre,
      type:        payload.type ?? 'texte',
      description: payload.description ?? '',
      contenu:     payload.contenu ?? '',
      url:         payload.url ?? '',
      thumbnail:   payload.thumbnail ?? '',
      duree:       payload.duree ?? 0,
      ordre:       payload.ordre ?? 0,
      is_free:     payload.is_free ?? true,
      status:      payload.status ?? 'draft'
    });
  }

  getCoursePaths(courseId: number) {
    return this.api.get<ApiResponse<{ paths: { id: number; titre: string }[] }>>(`/courses/${courseId}/paths`);
  }

  updateLesson(id: number, payload: Partial<Lesson>) {
    return this.api.put<ApiResponse<unknown>>(`/lessons/${id}`, payload);
  }

  deleteLesson(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/lessons/${id}`);
  }

  // ----- Ressources -----
  listResources(lessonId: number) {
    return this.api.get<ApiResponse<{ resources: Resource[] }>>(
      '/resources',
      { lesson_id: lessonId }
    );
  }

  createResource(payload: Partial<Resource>) {
    return this.api.post<ApiResponse<{ resourceId: number }>>('/resources', payload);
  }

  deleteResource(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/resources/${id}`);
  }
}
