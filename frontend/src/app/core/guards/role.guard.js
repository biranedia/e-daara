import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
/**
 * Garde de rôle paramétrable :
 *   { path: 'admin', canActivate: [roleGuard(['admin'])], ... }
 * Bloque l'accès si l'utilisateur n'a aucun des rôles requis.
 */
export const roleGuard = (allowed) => {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        if (!auth.isAuthenticated()) {
            return router.createUrlTree(['/auth/login']);
        }
        const roles = auth.roles();
        const ok = allowed.some((r) => roles.includes(r));
        return ok ? true : router.createUrlTree(['/']);
    };
};
