var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
/**
 * Service Notifications / Messages / Forum / Annonces / Certificats / Badges.
 */
let SocialService = (() => {
    let _classDecorators = [Injectable({ providedIn: 'root' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SocialService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SocialService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        api = inject(ApiService);
        // ----- Notifications -----
        listNotifications() {
            return this.api.get('/notifications');
        }
        markNotificationRead(id) {
            return this.api.put(`/notifications/${id}/read`, {});
        }
        deleteNotification(id) {
            return this.api.delete(`/notifications/${id}`);
        }
        createNotification(payload) {
            return this.api.post('/notifications', payload);
        }
        // ----- Recherche utilisateurs (pour messagerie) -----
        searchUsers(q) {
            return this.api.get('/users/search', { q });
        }
        // ----- Messagerie privée -----
        listMessages(box = 'inbox') {
            return this.api.get('/messages', { box });
        }
        sendMessage(payload) {
            // Le backend attend `corps` et non `contenu`
            return this.api.post('/messages', {
                destinataire_id: payload.destinataire_id,
                sujet: payload.sujet,
                corps: payload.contenu
            });
        }
        markMessageRead(id) {
            return this.api.put(`/messages/${id}/read`, {});
        }
        deleteMessage(id) {
            return this.api.delete(`/messages/${id}`);
        }
        // ----- Forum -----
        listPosts() {
            return this.api.get('/forum');
        }
        getPost(id) {
            return this.api.get(`/forum/${id}`);
        }
        createPost(payload) {
            // Le backend attend `corps` et non `contenu`
            return this.api.post('/forum', {
                titre: payload.titre,
                corps: payload.contenu,
                course_id: payload.course_id,
                parent_id: payload.parent_id
            });
        }
        updatePost(id, payload) {
            return this.api.put(`/forum/${id}`, payload);
        }
        deletePost(id) {
            return this.api.delete(`/forum/${id}`);
        }
        // ----- Annonces -----
        listAnnouncements(courseId) {
            const params = courseId ? { course_id: courseId } : {};
            return this.api.get('/announcements', params);
        }
        createAnnouncement(payload) {
            return this.api.post('/announcements', {
                course_id: payload.course_id,
                titre: payload.titre,
                corps: payload.contenu ?? payload.corps
            });
        }
        updateAnnouncement(id, payload) {
            return this.api.put(`/announcements/${id}`, {
                titre: payload.titre,
                corps: payload.contenu ?? payload.corps
            });
        }
        deleteAnnouncement(id) {
            return this.api.delete(`/announcements/${id}`);
        }
        // ----- Certificats -----
        listMyCertificates() {
            return this.api.get('/certificates');
        }
        verifyCertificate(numero) {
            return this.api.get(`/certificates/verify/${numero}`);
        }
        issueCertificate(payload) {
            return this.api.post('/certificates/issue', payload);
        }
        // ----- Badges -----
        listAllBadges() {
            return this.api.get('/badges');
        }
        listMyBadges() {
            return this.api.get('/badges/mine');
        }
        createBadge(payload) {
            return this.api.post('/badges', payload);
        }
        updateBadge(id, payload) {
            return this.api.put(`/badges/${id}`, payload);
        }
        deleteBadge(id) {
            return this.api.delete(`/badges/${id}`);
        }
        badgeStats() {
            return this.api.get('/badges/stats');
        }
    };
    return SocialService = _classThis;
})();
export { SocialService };
