import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';
import { ApiResponse, MediaFile } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly api    = inject(ApiService);
  private readonly http   = inject(HttpClient);
  private readonly tokens = inject(TokenStorageService);

  upload(file: File, contextType?: string, contextId?: number) {
    const form = new FormData();
    form.append('file', file);
    if (contextType) form.append('context_type', contextType);
    if (contextId)   form.append('context_id', String(contextId));
    const token = this.tokens.getAccessToken();
    return this.http.post<ApiResponse<{ url: string; mediaId: number; taille_ko: number; fileName: string }>>(
      `${environment.apiUrl}/media/upload`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

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
