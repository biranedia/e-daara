import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse, MediaFile } from '../models';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly api = inject(ApiService);

  list(params: { contexte?: string } = {}) {
    return this.api.get<ApiResponse<{ files: MediaFile[] }>>(
      '/media',
      params as Record<string, string>
    );
  }

  register(payload: {
    nom_original: string;
    nom_stockage: string;
    mime_type: string;
    taille: number;
    url: string;
    contexte?: MediaFile['contexte'];
    resource_id?: number;
  }) {
    return this.api.post<ApiResponse<{ fileId: number }>>('/media', payload);
  }

  delete(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/media/${id}`);
  }
}
