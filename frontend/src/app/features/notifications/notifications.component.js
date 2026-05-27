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
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SocialService } from '@core/services/social.service';
let NotificationsComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-notifications',
            standalone: true,
            changeDetection: ChangeDetectionStrategy.OnPush,
            imports: [CommonModule, MatButtonModule, MatIconModule],
            template: `
    <div class="max-w-3xl mx-auto px-6 py-8 space-y-3">
      <header>
        <h1 class="text-2xl font-bold text-edaara-dark">Notifications</h1>
        <p class="text-slate-500">{{ notifications().length }} notification(s)</p>
      </header>

      @for (n of notifications(); track n.id) {
        <article class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-3"
                 [class.border-l-4]="!n.lu_at"
                 [class.border-l-edaara-primary]="!n.lu_at">
          <mat-icon [class]="iconColor(n.type)">{{ iconName(n.type) }}</mat-icon>
          <div class="flex-1">
            @if (n.titre) {
              <p class="font-semibold text-edaara-dark">{{ n.titre }}</p>
            }
            <p class="text-sm text-slate-700">{{ n.message }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ n.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <div class="flex flex-col gap-1">
            @if (!n.lu_at) {
              <button mat-icon-button (click)="markRead(n)" aria-label="Marquer comme lu">
                <mat-icon>check_circle</mat-icon>
              </button>
            }
            <button mat-icon-button (click)="remove(n)" aria-label="Supprimer">
              <mat-icon class="!text-red-500">delete</mat-icon>
            </button>
          </div>
        </article>
      } @empty {
        <p class="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-100">
          Aucune notification
        </p>
      }
    </div>
  `
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationsComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationsComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        social = inject(SocialService);
        notifications = signal([]);
        ngOnInit() {
            this.load();
        }
        load() {
            this.social.listNotifications().subscribe({
                next: (res) => this.notifications.set(res.data?.notifications ?? [])
            });
        }
        markRead(n) {
            this.social.markNotificationRead(n.id).subscribe({ next: () => this.load() });
        }
        remove(n) {
            this.social.deleteNotification(n.id).subscribe({ next: () => this.load() });
        }
        iconName(t) {
            return { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' }[t] ?? 'notifications';
        }
        iconColor(t) {
            return {
                info: 'text-blue-500',
                success: 'text-green-500',
                warning: 'text-amber-500',
                error: 'text-red-500'
            }[t] ?? 'text-slate-500';
        }
    };
    return NotificationsComponent = _classThis;
})();
export { NotificationsComponent };
