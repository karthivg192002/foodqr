import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredRoles: UserRole[] = route.data['roles'];
    if (requiredRoles?.length) {
      const hasRole = requiredRoles.includes(this.authService.currentUser?.role);
      if (!hasRole) {
        this.router.navigate([this.authService.getRedirectPath()]);
        return false;
      }
    }
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated) {
      this.router.navigate([this.authService.getRedirectPath()]);
      return false;
    }
    return true;
  }
}
