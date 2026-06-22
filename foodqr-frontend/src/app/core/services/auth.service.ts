import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRole } from '../models';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { this.currentUserSubject.next(JSON.parse(storedUser)); } catch {}
    }
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get token(): string | null { return localStorage.getItem('token'); }
  get isAuthenticated(): boolean { return !!this.token && !!this.currentUser; }
  get isSuperAdmin(): boolean { return this.currentUser?.role === UserRole.SUPER_ADMIN; }
  get isAdmin(): boolean { return this.currentUser?.role === UserRole.ADMIN; }
  get isBranchManager(): boolean { return this.currentUser?.role === UserRole.BRANCH_MANAGER; }
  get isCustomer(): boolean { return this.currentUser?.role === UserRole.CUSTOMER; }
  get isKitchenStaff(): boolean { return [UserRole.CHEF, UserRole.STAFF].includes(this.currentUser?.role); }
  get isWaiter(): boolean { return this.currentUser?.role === UserRole.WAITER; }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', { email, password }).pipe(
      tap((res: AuthResponse) => this.setSession(res))
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', data).pipe(
      tap((res: AuthResponse) => this.setSession(res))
    );
  }

  sendOtp(email: string) { return this.api.post('auth/otp/send', { email }); }
  verifyOtp(email: string, otp: string) { return this.api.post('auth/otp/verify', { email, otp }); }
  forgotPassword(email: string) { return this.api.post('auth/forgot-password', { email }); }
  resetPassword(token: string, password: string) { return this.api.post('auth/reset-password', { token, password }); }

  getProfile(): Observable<User> {
    return this.api.get<User>('auth/profile').pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.api.patch<User>('profile', data).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  setToken(token: string, user?: User): void {
    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  private setSession(auth: AuthResponse): void {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user));
    this.currentUserSubject.next(auth.user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getRedirectPath(): string {
    const role = this.currentUser?.role;
    switch (role) {
      case UserRole.SUPER_ADMIN: return '/superadmin/dashboard';
      case UserRole.ADMIN:
      case UserRole.BRANCH_MANAGER: return '/admin/dashboard';
      case UserRole.CHEF:
      case UserRole.STAFF: return '/kds';
      case UserRole.WAITER: return '/admin/staff-dashboard';
      case UserRole.POS_OPERATOR: return '/pos';
      case UserRole.CUSTOMER: return '/customer/home';
      default: return '/auth/login';
    }
  }
}
