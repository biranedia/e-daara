import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  Announcement,
  ApiResponse,
  Badge,
  Certificate,
  ForumPost,
  Message,
  Notification,
  UserBadge
} from '../models';

/**
 * Service Notifications / Messages / Forum / Annonces / Certificats / Badges.
 */
@Injectable({ providedIn: 'root' })
export class SocialService {
  private readonly api = inject(ApiService);

  // ----- Notifications -----
  listNotifications() {
    return this.api.get<ApiResponse<{ notifications: Notification[] }>>('/notifications');
  }

  markNotificationRead(id: number) {
    return this.api.put<ApiResponse<unknown>>(`/notifications/${id}/read`, {});
  }

  deleteNotification(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/notifications/${id}`);
  }

  createNotification(payload: Partial<Notification>) {
    return this.api.post<ApiResponse<unknown>>('/notifications', payload);
  }

  // ----- Messagerie privée -----
  listMessages() {
    return this.api.get<ApiResponse<{ messages: Message[] }>>('/messages');
  }

  sendMessage(payload: { destinataire_id: number; sujet?: string; contenu: string }) {
    // Le backend attend `corps` et non `contenu`
    return this.api.post<ApiResponse<{ messageId: number }>>('/messages', {
      destinataire_id: payload.destinataire_id,
      sujet: payload.sujet,
      corps: payload.contenu
    });
  }

  markMessageRead(id: number) {
    return this.api.put<ApiResponse<unknown>>(`/messages/${id}/read`, {});
  }

  deleteMessage(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/messages/${id}`);
  }

  // ----- Forum -----
  listPosts() {
    return this.api.get<ApiResponse<{ posts: ForumPost[] }>>('/forum');
  }

  getPost(id: number) {
    return this.api.get<ApiResponse<{ post: ForumPost; replies: ForumPost[] }>>(
      `/forum/${id}`
    );
  }

  createPost(payload: { titre: string; contenu: string; course_id?: number; parent_id?: number }) {
    // Le backend attend `corps` et non `contenu`
    return this.api.post<ApiResponse<{ postId: number }>>('/forum', {
      titre: payload.titre,
      corps: payload.contenu,
      course_id: payload.course_id,
      parent_id: payload.parent_id
    });
  }

  updatePost(id: number, payload: Partial<ForumPost>) {
    return this.api.put<ApiResponse<unknown>>(`/forum/${id}`, payload);
  }

  deletePost(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/forum/${id}`);
  }

  // ----- Annonces -----
  listAnnouncements(courseId?: number) {
    const params = courseId ? { course_id: courseId } : {};
    return this.api.get<ApiResponse<{ announcements: Announcement[] }>>('/announcements', params as Record<string, number>);
  }

  createAnnouncement(payload: Partial<Announcement> & { contenu?: string }) {
    return this.api.post<ApiResponse<unknown>>('/announcements', {
      course_id: payload.course_id,
      titre: payload.titre,
      corps: payload.contenu ?? payload.corps
    });
  }

  updateAnnouncement(id: number, payload: Partial<Announcement> & { contenu?: string }) {
    return this.api.put<ApiResponse<unknown>>(`/announcements/${id}`, {
      titre: payload.titre,
      corps: payload.contenu ?? payload.corps
    });
  }

  deleteAnnouncement(id: number) {
    return this.api.delete<ApiResponse<unknown>>(`/announcements/${id}`);
  }

  // ----- Certificats -----
  listMyCertificates() {
    return this.api.get<ApiResponse<{ certificates: Certificate[] }>>('/certificates');
  }

  verifyCertificate(numero: string) {
    return this.api.get<ApiResponse<{ certificate: Certificate }>>(
      `/certificates/verify/${numero}`
    );
  }

  issueCertificate(payload: { user_id: number; course_id?: number; path_id?: number }) {
    return this.api.post<ApiResponse<{ certificateId: number; numero_serie: string }>>(
      '/certificates/issue',
      payload
    );
  }

  // ----- Badges -----
  listAllBadges() {
    return this.api.get<ApiResponse<{ badges: Badge[] }>>('/badges');
  }

  listMyBadges() {
    return this.api.get<ApiResponse<{ badges: UserBadge[] }>>('/badges/mine');
  }

  createBadge(payload: Partial<Badge>) {
    return this.api.post<ApiResponse<{ badgeId: number }>>('/badges', payload);
  }

  awardBadge(payload: { user_id: number; badge_id: number }) {
    return this.api.post<ApiResponse<unknown>>('/badges/award', payload);
  }
}
