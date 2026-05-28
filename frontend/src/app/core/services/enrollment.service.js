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
 * Service Inscriptions + Progression + Sessions de travail.
 * /api/enrollments  /api/progress  /api/work-sessions
 */
let EnrollmentService = (() => {
    let _classDecorators = [Injectable({ providedIn: 'root' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EnrollmentService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EnrollmentService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        api = inject(ApiService);
        listMine() {
            return this.api.get('/enrollments');
        }
        /**
         * Tableau de bord apprenant : stats personnelles (cours suivis, terminés, progression moy.)
         * Endpoint : GET /api/dashboard/student
         */
        studentDashboard() {
            return this.api.get('/dashboard/student');
        }
        enroll(courseId) {
            return this.api.post('/enrollments', { course_id: courseId });
        }
        updateProgress(enrollmentId, progression) {
            return this.api.put(`/enrollments/${enrollmentId}/progress`, { progression });
        }
        complete(enrollmentId) {
            return this.api.post(`/enrollments/${enrollmentId}/complete`, {});
        }
        // ----- Progression leçon -----
        getLessonProgress() {
            return this.api.get('/progress/lessons');
        }
        setLessonProgress(payload) {
            return this.api.post('/progress/lessons', {
                lesson_id: payload.lesson_id,
                enrollment_id: payload.enrollment_id,
                completed: payload.status === 'completed',
                temps_passe: payload.temps_passe ?? payload.duration_seconds
            });
        }
        getPathProgress() {
            return this.api.get('/progress/paths');
        }
        enrollPath(pathId) {
            return this.api.post('/progress/paths', { path_id: pathId });
        }
        updatePathProgress(id, payload) {
            return this.api.put(`/progress/paths/${id}`, payload);
        }
        // ----- Sessions de travail (souveraineté : suivi temps réel) -----
        startSession(courseId) {
            return this.api.post('/work-sessions', {
                course_id: courseId ?? null
            });
        }
        stopSession(sessionId) {
            return this.api.put(`/work-sessions/${sessionId}/stop`, {});
        }
        listSessions() {
            return this.api.get('/work-sessions');
        }
    };
    return EnrollmentService = _classThis;
})();
export { EnrollmentService };
