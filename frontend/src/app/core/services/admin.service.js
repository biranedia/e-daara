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
 * Service Administration — souveraineté numérique en tête (audit logs).
 * Endpoints : /api/admin/* + /api/stats + /api/settings + /api/gdpr + /api/dashboard
 */
let AdminService = (() => {
    let _classDecorators = [Injectable({ providedIn: 'root' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        api = inject(ApiService);
        // ----- Dashboard admin -----
        dashboard() {
            return this.api.get('/admin/dashboard');
        }
        // ----- Dashboard apprenant -----
        studentDashboard() {
            return this.api.get('/dashboard/student');
        }
        // ----- Gestion utilisateurs -----
        listUsers() {
            return this.api.get('/admin/users');
        }
        /** Créer un utilisateur depuis l'interface admin */
        createUser(payload) {
            return this.api.post('/admin/users', payload);
        }
        /** Modifier nom, prénom, email (et optionnellement le mot de passe) d'un utilisateur */
        updateUser(userId, payload) {
            return this.api.put(`/admin/users/${userId}`, payload);
        }
        /** Suppression douce (soft delete) d'un utilisateur */
        deleteUser(userId) {
            return this.api.delete(`/admin/users/${userId}`);
        }
        updateUserStatus(userId, status) {
            return this.api.put(`/admin/users/${userId}/status`, { status });
        }
        assignRoles(userId, roles) {
            return this.api.put(`/admin/users/${userId}/roles`, { roles });
        }
        // ----- Validation des cours -----
        pendingCourses() {
            return this.api.get('/admin/courses/pending');
        }
        validateCourse(id, decision, commentaire) {
            return this.api.post(`/admin/courses/${id}/validate`, {
                decision,
                commentaire
            });
        }
        /** Historique complet des validations automatiques et manuelles */
        validationHistory() {
            return this.api.get('/admin/courses/validations');
        }
        // ----- Audit logs (coeur souveraineté) -----
        auditLogs() {
            return this.api.get('/admin/audit-logs');
        }
        // ----- Statistiques globales -----
        latestStats() {
            return this.api.get('/stats/latest');
        }
        statsHistory(limit = 30) {
            return this.api.get('/stats/history', { limit });
        }
        refreshStats() {
            return this.api.post('/stats/refresh', {});
        }
        // ----- Paramètres plateforme -----
        listSettings() {
            return this.api.get('/settings');
        }
        updateSetting(cle, valeur) {
            return this.api.put(`/settings/${cle}`, { valeur });
        }
        // ----- RGPD / Loi sénégalaise n°2008-12 -----
        myGdprRequests() {
            return this.api.get('/gdpr/mine');
        }
        allGdprRequests() {
            return this.api.get('/gdpr');
        }
        createGdprRequest(type, detail) {
            return this.api.post('/gdpr', { type, detail });
        }
        updateGdprStatus(id, statut) {
            return this.api.put(`/gdpr/${id}/status`, { statut });
        }
    };
    return AdminService = _classThis;
})();
export { AdminService };
