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
 * Service Cours — branché sur /api/courses, /api/sections, /api/lessons, /api/public/courses.
 */
let CourseService = (() => {
    let _classDecorators = [Injectable({ providedIn: 'root' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CourseService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CourseService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        api = inject(ApiService);
        // ----- Catalogue public -----
        listPublic(params = {}) {
            return this.api.get('/public/courses', params);
        }
        getPublicCourse(id) {
            // Backend : res.json({ success: true, data: { ...course, sections } })
            return this.api.get(`/public/courses/${id}`);
        }
        listCategories() {
            return this.api.get('/public/categories');
        }
        // ----- Espace formateur / admin -----
        listMine() {
            return this.api.get('/courses');
        }
        get(id) {
            return this.api.get(`/courses/${id}`);
        }
        create(payload) {
            return this.api.post('/courses', payload);
        }
        update(id, payload) {
            return this.api.put(`/courses/${id}`, payload);
        }
        delete(id) {
            return this.api.delete(`/courses/${id}`);
        }
        submit(id) {
            return this.api.post(`/courses/${id}/submit`, {});
        }
        // ----- Sections -----
        listSections(courseId) {
            return this.api.get('/sections', { course_id: courseId });
        }
        getSection(id) {
            // Backend : { section, lessons } — lessons séparé, PAS imbriqué dans section
            return this.api.get(`/sections/${id}`);
        }
        createSection(payload) {
            return this.api.post('/sections', payload);
        }
        updateSection(id, payload) {
            return this.api.put(`/sections/${id}`, payload);
        }
        deleteSection(id) {
            return this.api.delete(`/sections/${id}`);
        }
        // ----- Leçons -----
        listLessons(sectionId) {
            return this.api.get('/lessons', { section_id: sectionId });
        }
        getLesson(id) {
            // Backend : { lesson, resources }
            return this.api.get(`/lessons/${id}`);
        }
        createLesson(payload) {
            // Backend requiert : section_id + course_id + titre (sans course_id => 400)
            return this.api.post('/lessons', {
                section_id: payload.section_id,
                course_id: payload.course_id,
                titre: payload.titre,
                description: payload.description ?? '',
                contenu: payload.contenu ?? '',
                duree: payload.duree ?? 0,
                ordre: payload.ordre ?? 0,
                is_free: payload.is_free ?? true,
                status: payload.status ?? 'draft'
            });
        }
        updateLesson(id, payload) {
            return this.api.put(`/lessons/${id}`, payload);
        }
        deleteLesson(id) {
            return this.api.delete(`/lessons/${id}`);
        }
        // ----- Ressources -----
        listResources(lessonId) {
            return this.api.get('/resources', { lesson_id: lessonId });
        }
        createResource(payload) {
            return this.api.post('/resources', payload);
        }
        deleteResource(id) {
            return this.api.delete(`/resources/${id}`);
        }
    };
    return CourseService = _classThis;
})();
export { CourseService };
