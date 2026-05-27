import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, Course, Path } from '../models';

export interface CourseInPath {
  id: number;
  titre: string;
  slug?: string;
  description?: string;
  niveau?: string;
  duree?: number;
  ordre: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class PathService {
  private readonly api = inject(ApiService);

  listPublic() {
    return this.api.get<ApiResponse<{ paths: Path[] }>>('/public/paths');
  }

  list() {
    return this.api.get<ApiResponse<{ paths: Path[] }>>('/paths');
  }

  get(id: number) {
    return this.api.get<ApiResponse<{ path: Path; courses: CourseInPath[] }>>(`/paths/${id}`);
  }

  create(payload: Partial<Path> & { course_ids?: number[] }) {
    return this.api.post<ApiResponse<{ pathId: number }>>('/paths', payload);
  }

  update(id: number, payload: Partial<Path> & { course_ids?: number[] }) {
    return this.api.put<ApiResponse<unknown>>(`/paths/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/paths/${id}`);
  }

  addCourse(pathId: number, courseId: number, ordre?: number) {
    return this.api.post<ApiResponse<unknown>>(`/paths/${pathId}/courses`, { course_id: courseId, ordre });
  }

  removeCourse(pathId: number, courseId: number) {
    return this.api.delete<ApiResponse<unknown>>(`/paths/${pathId}/courses/${courseId}`);
  }
}
