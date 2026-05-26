import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, Path } from '../models';

/**
 * Service Parcours (groupes de cours pour atteindre un objectif).
 * Endpoints : /api/paths  /api/public/paths
 */
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
    return this.api.get<ApiResponse<{ path: Path }>>(`/paths/${id}`);
  }

  create(payload: Partial<Path>) {
    return this.api.post<ApiResponse<{ pathId: number }>>('/paths', payload);
  }

  update(id: number, payload: Partial<Path>) {
    return this.api.put<ApiResponse<unknown>>(`/paths/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/paths/${id}`);
  }
}
