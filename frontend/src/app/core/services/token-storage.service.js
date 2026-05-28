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
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
/**
 * Stockage local des tokens JWT et de l'utilisateur courant.
 * Encapsule localStorage pour pouvoir basculer plus tard vers
 * sessionStorage / cookies sécurisés sans toucher le reste du code.
 */
let TokenStorageService = (() => {
    let _classDecorators = [Injectable({ providedIn: 'root' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TokenStorageService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TokenStorageService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        accessKey = environment.tokenStorageKey;
        refreshKey = environment.refreshTokenStorageKey;
        userKey = environment.userStorageKey;
        getAccessToken() {
            return localStorage.getItem(this.accessKey);
        }
        getRefreshToken() {
            return localStorage.getItem(this.refreshKey);
        }
        getUser() {
            const raw = localStorage.getItem(this.userKey);
            return raw ? JSON.parse(raw) : null;
        }
        saveTokens(accessToken, refreshToken) {
            localStorage.setItem(this.accessKey, accessToken);
            localStorage.setItem(this.refreshKey, refreshToken);
        }
        saveAccessToken(accessToken) {
            localStorage.setItem(this.accessKey, accessToken);
        }
        saveUser(user) {
            localStorage.setItem(this.userKey, JSON.stringify(user));
        }
        clear() {
            localStorage.removeItem(this.accessKey);
            localStorage.removeItem(this.refreshKey);
            localStorage.removeItem(this.userKey);
        }
    };
    return TokenStorageService = _classThis;
})();
export { TokenStorageService };
